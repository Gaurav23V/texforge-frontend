"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "@/lib/date-utils"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useProjects } from "@/hooks/use-projects"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, FileText, Loader2, Plus, Trash2 } from "lucide-react"

export function ProjectList() {
  const { projects, loading, error, createProject, deleteProject } = useProjects()
  const reduceMotion = useReducedMotion()
  const [newProjectName, setNewProjectName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newProjectName.trim()) return

    setIsCreating(true)
    try {
      const project = await createProject(newProjectName.trim())
      setNewProjectName("")
      setCreateDialogOpen(false)
      window.location.href = `/editor/${project.id}`
    } catch (err) {
      console.error("Failed to create project:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id)
      setDeleteDialogOpen(null)
    } catch (err) {
      console.error("Failed to delete project:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Error loading projects: {error}</p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </p>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="brand">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Enter a name for your new LaTeX project.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating || !newProjectName.trim()}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.25, ease: "easeOut" }}
        >
          <EmptyState
            icon={FileText}
            title="No projects yet"
            description="Create your first LaTeX workspace and start compiling instantly."
            action={
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first project
              </Button>
            }
          />
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={reduceMotion ? undefined : { duration: 0.28, ease: "easeOut", delay: index * 0.04 }}
            >
              <Card className="group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-card">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-rose opacity-80"
                />
                <Link href={`/editor/${project.id}`} className="block">
                  <CardHeader className="space-y-2">
                    <CardTitle className="line-clamp-1 text-lg">{project.name}</CardTitle>
                    <CardDescription>
                      Updated {formatDistanceToNow(project.updated_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Open editor
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Link>
                <Dialog
                  open={deleteDialogOpen === project.id}
                  onOpenChange={(open) => setDeleteDialogOpen(open ? project.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100"
                      aria-label={`Delete project ${project.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Project</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete &quot;{project.name}&quot;? This action
                        cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(project.id)}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
