import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, MapPin } from "lucide-react"
import Link from "next/link"

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  type: "gis" | "web"
  className?: string
}

export function ProjectCard({ title, description, tags, type, className }: ProjectCardProps) {
  return (
    <Link href="#">
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
          type === "gis" ? "hover:border-secondary" : "hover:border-primary",
          className,
        )}
      >
        <div className="absolute right-4 top-4">
          {type === "gis" ? <MapPin className="h-6 w-6 text-secondary" /> : <Layers className="h-6 w-6 text-primary" />}
        </div>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                  "bg-opacity-10",
                  type === "gis" ? "bg-secondary text-secondary" : "bg-primary text-primary",
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full",
            type === "gis" ? "bg-secondary" : "bg-primary",
          )}
        />
      </Card>
    </Link>
  )
}

