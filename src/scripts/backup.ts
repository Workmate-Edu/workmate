import { connectDB, disconnect } from "@/lib/mongodb"
import { Child } from "@/models/child"
import fs from 'fs'

async function backup() {
  try {
    await connectDB()
    const children = await Child.find().lean()
    fs.writeFileSync('children-backup.json', JSON.stringify(children, null, 2))
    console.log(`✅ Backed up ${children.length} children`)
  } catch (error) {
    console.error('❌ Backup failed:', error)
  } finally {
    await disconnect()
  }
}

backup()
