import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await connectDB()
    
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    let query = {}

    if (session.user.role === 'teacher') {
      // Get students with their parent info
      const students = await User.find({
        role: 'student'
      })
      .populate('parent', 'name email role') // Note: Use 'parent' instead of 'parentId'
      .select('name email role studentProfile.registeredAs parent')
      .lean();
      
      // Transform students to include correct messaging target
      const transformedUsers = students.map(student => {
        const isChildStudent = student.studentProfile?.registeredAs === 'child' && student.parent;
        
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
          type: isChildStudent ? 'child' : 'independent',
          messageTarget: isChildStudent ? {
            _id: student.parent._id,
            name: student.parent.name,
            email: student.parent.email,
            role: 'parent'
          } : null,
          studentInfo: isChildStudent ? {
            name: student.name,
            id: student._id
          } : null
        };
      });

      console.log('Transformed users:', transformedUsers); // Debug log
      return NextResponse.json(transformedUsers);
    } else if (session.user.role === 'student') {
      // Get teachers for student's subjects
      const student = await User.findById(session.user.id)
        .select('studentProfile.subjects')

      query = {
        role: 'teacher',
        'teacherProfile.subjects': {
          $elemMatch: {
            $or: student.studentProfile.subjects.map((s: any) => ({
              area: s.area,
              subjects: s.name
            }))
          }
        }
      }
    }

    if (search) {
      query = {
        ...query,
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      }
    }

    const users = await User.find(query)
      .select('name email role studentProfile.grade teacherProfile.subjects')
      .limit(20)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
