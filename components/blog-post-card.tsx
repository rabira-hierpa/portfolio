import { CalendarDays } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BlogPostCardProps {
  title: string
  excerpt: string
  date: string
  imageUrl: string
  category: string
  slug: string
}

export function BlogPostCard({ title, excerpt, date, imageUrl, category, slug }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-primary/80">{category}</Badge>
        </div>
        <CardHeader>
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            {date}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

