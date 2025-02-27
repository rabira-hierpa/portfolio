import { Github, Linkedin, Twitter, MapPin, Globe2, Plane } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { LeafletMap } from "@/components/leaflet-map"
import { ProjectCard } from "@/components/project-card"
import { BlogPostCard } from "@/components/blog-post-card"

export default function Home() {
  const blogPosts = [
    {
      title: "Leveraging GIS for Smart City Planning",
      excerpt:
        "Explore how GIS technologies are revolutionizing urban development and creating more sustainable, efficient cities.",
      date: "May 15, 2023",
      imageUrl: "/placeholder.svg?height=300&width=400",
      category: "GIS",
      slug: "leveraging-gis-for-smart-city-planning",
    },
    {
      title: "The Future of Web Mapping Libraries",
      excerpt:
        "A deep dive into the latest web mapping libraries and how they're shaping the future of interactive online maps.",
      date: "June 2, 2023",
      imageUrl: "/placeholder.svg?height=300&width=400",
      category: "Web Dev",
      slug: "future-of-web-mapping-libraries",
    },
    {
      title: "Optimizing Geospatial Queries in PostgreSQL",
      excerpt: "Learn advanced techniques for improving the performance of geospatial queries in PostgreSQL databases.",
      date: "June 20, 2023",
      imageUrl: "/placeholder.svg?height=300&width=400",
      category: "Database",
      slug: "optimizing-geospatial-queries-postgresql",
    },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 z-0">
          <LeafletMap />
        </div>
        <div className="container relative z-10 px-4 flex flex-col items-start justify-center">
          <div className="max-w-3xl text-white mb-8 text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mapping the
              <span className="block text-primary">Digital World</span>
              One Project at a Time
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-8">
              GIS Developer & Full Stack Engineer specializing in interactive mapping solutions and location-based
              applications
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                View Projects
              </Button>
              <Button size="lg" variant="outline" className="text-black bg-white border-white hover:bg-white/90">
                Read Blog
              </Button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center gap-6 text-white/60">
          <Link href="#" className="hover:text-primary transition-colors">
            <Linkedin className="h-6 w-6" />
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            <Github className="h-6 w-6" />
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            <Twitter className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-zinc-50">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">My Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-secondary justify-center">
                <MapPin className="h-5 w-5" />
                <h2 className="text-2xl font-bold">GIS Development</h2>
              </div>
              <p className="text-zinc-600">
                Specialized in creating interactive mapping solutions, spatial analysis tools, and location-based
                services that transform complex geographical data into actionable insights.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary justify-center">
                <Globe2 className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Web Development</h2>
              </div>
              <p className="text-zinc-600">
                Building modern, responsive web applications with cutting-edge technologies to deliver seamless user
                experiences and powerful functionality.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-12">Featured Projects</h2>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <ProjectCard
              type="gis"
              title="SoundSite"
              description="3D acoustic modeling system for environmental noise prediction"
              tags={["GIS", "3D Modeling", "Python"]}
            />
            <ProjectCard
              type="web"
              title="SoundSurfer"
              description="Web-based sound calculation tool for acoustic consultants"
              tags={["React", "Node.js", "WebGL"]}
            />
            <ProjectCard
              type="gis"
              title="Cleos"
              description="Location-based pet insurance and veterinary service finder"
              tags={["Mapping", "React", "PostgreSQL"]}
            />
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-20 bg-zinc-50">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Latest Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <BlogPostCard
                key={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                imageUrl={post.imageUrl}
                category={post.category}
                slug={post.slug}
              />
            ))}
          </div>
          <div className="mt-12">
            <Button asChild>
              <Link href="/blog">View All Posts</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

