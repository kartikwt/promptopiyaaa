import { NextResponse } from 'next/server';
import { getServerSession } from 'cosmic-authentication';
import { db } from 'cosmic-database';

const ADMIN_EMAIL = 'kumawatkartikey361@gmail.com';

export async function GET() {
  try {
    const user = await getServerSession();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    // Determine signup bonus (check emailBonuses collection)
    let signupBonus = 20;
    if (user.email === ADMIN_EMAIL) signupBonus = 100;
    try {
      const bonusDoc = await db.collection('emailBonuses').doc(encodeURIComponent((user.email || '').toLowerCase())).get();
      if (bonusDoc.exists) {
        const data = bonusDoc.data();
        if (typeof data?.credits === 'number') {
          signupBonus = Math.max(signupBonus, data.credits as number);
        }
      }
    } catch {
      // ignore bonus read errors
    }

    if (!userDoc.exists) {
      // Create new user with signup bonus
      await userRef.set({
        email: user.email,
        displayName: user.displayName,
        credits: signupBonus,
        signupBonusApplied: true,
        isAdmin: user.uid === process.env.USER_ID || user.email === ADMIN_EMAIL,
        createdAt: db.FieldValue.serverTimestamp(),
        updatedAt: db.FieldValue.serverTimestamp()
      });

      return NextResponse.json({
        credits: signupBonus,
        isAdmin: user.email === ADMIN_EMAIL || user.uid === process.env.USER_ID,
        email: user.email,
        displayName: user.displayName
      });
    }

    const userData = userDoc.data() as Record<string, unknown> | undefined;
    const currentCredits = typeof userData?.credits === 'number' ? (userData.credits as number) : 0;
    const alreadyApplied = userData?.signupBonusApplied === true;

    // Ensure special email has at least 100 credits
    if (user.email === ADMIN_EMAIL && currentCredits < 100) {
      await userRef.update({ credits: 100, signupBonusApplied: true, updatedAt: db.FieldValue.serverTimestamp() });
      return NextResponse.json({
        credits: 100,
        isAdmin: true,
        email: user.email,
        displayName: user.displayName
      });
    }

    // If the doc exists but the signup bonus hasn't been applied yet (common for Google/Gmail where auth auto-creates the doc)
    if (!alreadyApplied) {
      const newCredits = Math.max(currentCredits, signupBonus);
      await userRef.update({ credits: newCredits, signupBonusApplied: true, updatedAt: db.FieldValue.serverTimestamp() });
      return NextResponse.json({
        credits: newCredits,
        isAdmin: Boolean(userData?.isAdmin) || user.email === ADMIN_EMAIL || user.uid === process.env.USER_ID,
        email: user.email,
        displayName: user.displayName
      });
    }
    
    return NextResponse.json({
      credits: currentCredits,
      isAdmin: Boolean(userData?.isAdmin) || user.email === ADMIN_EMAIL || user.uid === process.env.USER_ID,
      email: user.email,
      displayName: user.displayName
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}