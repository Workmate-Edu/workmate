interface ChildMigrationData {
  name: string;
  email?: string;
  username: string;
  password?: string;
  parentId: string;
  grade: string;
  subjects: any[];
  assessments: any[];
  // ... other child data
}

export async function migrateChildToUser(childData: ChildMigrationData) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create new User record for child
    const newChildUser = await User.create([{
      name: childData.name,
      email: childData.email || `${childData.username}@workmateteam.com`, // Temporary email if none provided
      username: childData.username,
      password: childData.password, // Will be set later if using email verification
      role: 'student',
      learnerProfile: {
        type: 'child',
        parent: childData.parentId,
        grade: childData.grade,
        subjects: childData.subjects,
        assessments: childData.assessments
      },
      isActive: true
    }], { session });

    // 2. Update parent's learnerProfile with reference
    await User.findByIdAndUpdate(
      childData.parentId,
      {
        $push: {
          'parentProfile.children': newChildUser[0]._id
        }
      },
      { session }
    );

    // 3. If email provided, send verification
    if (childData.email) {
      await sendChildVerificationEmail({
        email: childData.email,
        name: childData.name,
        parentEmail: parentEmail
      });
    }

    await session.commitTransaction();
    return newChildUser[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}
