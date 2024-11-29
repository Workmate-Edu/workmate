import { sql } from "drizzle-orm"
import { 
  text, 
  timestamp, 
  pgTable,
  boolean,
  json
} from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const events = pgTable('events', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  type: text('type', { enum: ['class', 'office-hours', 'meeting'] }).notNull(),
  createdBy: text('created_by').notNull(), // user id
  googleEventId: text('google_event_id'),
  isSynced: boolean('is_synced').default(false),
  recurrence: json('recurrence').$type<{
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval?: number,
    daysOfWeek?: string[],
    until?: string
  }>(),
  attendees: json('attendees').$type<string[]>(),
  meetLink: text('meet_link'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const insertEventSchema = createInsertSchema(events)
export const selectEventSchema = createSelectSchema(events)

export type Event = z.infer<typeof selectEventSchema>
export type NewEvent = z.infer<typeof insertEventSchema>
