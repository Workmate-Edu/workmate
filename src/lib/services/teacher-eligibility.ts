import { User } from "@/models/user"

interface Subject {
  name: string
  area: string
}

export async function findEligibleTeachers(requiredSubjects: Subject[]) {
  try {
    console.log('Required subjects for matching:', JSON.stringify(requiredSubjects, null, 2))

    // Find teachers who can teach any of the required subjects
    const query = {
      role: 'teacher',
      isActive: true,
      'teacherProfile.verificationStatus': 'verified',
      'teacherProfile.subjects': {
        $elemMatch: {
          $or: requiredSubjects.map(subject => ({
            area: subject.area,
            subjects: { $in: [subject.name] }
          }))
        }
      }
    }

    console.log('Teacher query:', JSON.stringify(query, null, 2))

    const teachers = await User.find(query)
      .select(`
        name 
        email 
        teacherProfile.rating 
        teacherProfile.subjects 
        teacherProfile.availability
        teacherProfile.experienceYears
        bio
      `)
      .lean()

    console.log('Found teachers:', teachers.length)
    console.log('Sample teacher subjects:', teachers[0]?.teacherProfile?.subjects)

    // Calculate match scores
    const eligibleTeachers = teachers.map(teacher => {
      const matchingSubjects = requiredSubjects.filter(required =>
        teacher.teacherProfile?.subjects?.some(teacherSubject =>
          teacherSubject.area === required.area &&
          teacherSubject.subjects.includes(required.name)
        )
      )

      const matchPercentage = (matchingSubjects.length / requiredSubjects.length) * 100

      return {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        bio: teacher.bio || '',
        rating: teacher.teacherProfile?.rating || 0,
        experienceYears: teacher.teacherProfile?.experienceYears || 0,
        matchingSubjects: matchingSubjects,
        matchPercentage,
        availability: teacher.teacherProfile?.availability || [],
        subjects: teacher.teacherProfile?.subjects?.reduce((acc, s) => {
          s.subjects.forEach(subj => acc.push({
            area: s.area,
            name: subj
          }))
          return acc
        }, [] as Subject[]) || []
      }
    })

    // Sort and filter teachers
    return eligibleTeachers
      .filter(teacher => teacher.matchPercentage > 0) // At least one subject match
      .sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) {
          return b.matchPercentage - a.matchPercentage
        }
        return b.rating - a.rating
      })

  } catch (error) {
    console.error('[FIND_ELIGIBLE_TEACHERS_ERROR]', error)
    throw error
  }
}
