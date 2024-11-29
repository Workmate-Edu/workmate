"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Star, Info, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TeacherMatch {
  score: number;
  matchFactors: {
    subjectMatch: number;
    availabilityMatch: number;
    experienceScore: number;
    ratingScore: number;
    learningStyleMatch: number;
    languageMatch: number;
    priceMatch: number;
  };
  teacher: {
    id: string;
    name: string;
    bio: string;
    subjects: string[];
    experience: number;
    hourlyRate: number;
    averageRating: number | null;
  };
}

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const matchData = JSON.parse(decodeURIComponent(searchParams.get("data") || "{}"));
  const matches: TeacherMatch[] = matchData.matches || [];
  const learningStyle = matchData.learningStyle;

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Your Matched Teachers</h1>
        <p className="text-muted-foreground">
          We've found {matches.length} teachers that match your preferences and learning style.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(learningStyle).map(([style, score]) => (
            <Card key={style} className="p-4">
              <div className="text-sm font-medium">{style}</div>
              <div className="text-2xl font-bold">{Math.round(score as number)}%</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {matches.map((match) => (
          <Card key={match.teacher.id} className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.teacher.id}`}
                  alt={match.teacher.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{match.teacher.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{match.teacher.experience} years experience</span>
                      {match.teacher.averageRating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1">{match.teacher.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                      <span>${match.teacher.hourlyRate}/hour</span>
                    </div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getMatchColor(match.score)}`}
                          />
                          <span className="font-medium">{formatPercentage(match.score)}</span>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-2">
                          <div className="font-medium">Match Breakdown</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span>Subject Match:</span>
                              <span>{formatPercentage(match.matchFactors.subjectMatch)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Availability:</span>
                              <span>{formatPercentage(match.matchFactors.availabilityMatch)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Learning Style:</span>
                              <span>{formatPercentage(match.matchFactors.learningStyleMatch)}</span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{match.teacher.bio}</p>

                <div className="flex flex-wrap gap-2">
                  {match.teacher.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Button asChild>
                    <Link href={`/book/${match.teacher.id}`}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Book a Lesson
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/teacher/${match.teacher.id}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
