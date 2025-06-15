
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Plus, Search, Download, BarChart3, Folder, Star } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  messageCount: number;
  avgRating: number;
  lastUpdated: Date;
}

interface ProjectSidebarProps {
  projects: Project[];
  currentProject: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string) => void;
  onExportData: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onExportData,
  searchQuery,
  onSearchChange
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setShowCreateForm(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar className="w-80">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Projects</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            {showCreateForm && (
              <div className="p-2 space-y-2">
                <Input
                  placeholder="ชื่อโปรเจค..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleCreateProject}>
                    สร้าง
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}
            
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <SidebarMenu>
              {filteredProjects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    isActive={project.id === currentProject}
                    onClick={() => onSelectProject(project.id)}
                  >
                    <Folder className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{project.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{project.messageCount} ข้อความ</span>
                        {project.avgRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{project.avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>เครื่องมือ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onExportData}>
                  <Download className="h-4 w-4" />
                  ส่งออกข้อมูล
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart3 className="h-4 w-4" />
                  สถิติ
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ProjectSidebar;
