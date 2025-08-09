import { Link } from "react-router-dom";
import { type Basic, type Project, type Experience, type Skill, type Education } from "@/types/portfolio";
import { Badge } from "@/components/ui/badge";

type PortfolioPreviewProps = {
    basicInfo?: Basic;
    projects?: Project[];
    experiences?: Experience[];
    skills?: Skill[];
    education?: Education[];
};

export default function PortfolioPreview({
    basicInfo,
    projects,
    experiences,
    skills,
    education,
}: PortfolioPreviewProps) {
    return (
        <div className="min-h-screen bg-white py-6 px-4 font-serif w-full max-w-none mx-auto border border-gray-200 shadow-lg print:shadow-none print:border-0 print:p-5 print:m-0">
            {/* Header Section */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-300 print:px-0">
                {basicInfo ? (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-wide">
                            {basicInfo.name}
                        </h1>
                        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-600 mb-2">
                            <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                </svg>
                                {basicInfo.email}
                            </span>
                            <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" clipRule="evenodd"/>
                                </svg>
                                {basicInfo.contact_no}
                            </span>
                            <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                </svg>
                                {basicInfo.location}
                            </span>
                        </div>
                        {basicInfo.about && (
                            <p className="text-sm text-gray-700 leading-tight max-w-4xl mx-auto">
                                {basicInfo.about}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <h1 className="text-2xl font-bold mb-2">Your Name</h1>
                        <p className="text-sm">
                            No basic information added.{" "}
                            <Link to="/dashboard" className="text-blue-600 underline hover:text-blue-800">
                                Add now
                            </Link>
                        </p>
                    </div>
                )}
            </div>

            {/* Education Section */}
            {education && education.length > 0 && (
                <div className="px-6 py-4 print:px-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        EDUCATION
                    </h2>
                    <div className="space-y-4">
                        {education.map((edu, index) => (
                            <div key={edu.id ?? index} className="relative">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {edu.degree} at {edu.institution}
                                        </h3>
                                        <p className="text-sm text-gray-700 font-medium">
                                            {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                                            {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : " Present"}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-600 text-right">
                                        <p>{edu.Grade}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Experience Section */}
            {experiences && experiences.length > 0 && (
                <div className="px-6 py-4 print:px-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        PROFESSIONAL EXPERIENCE
                    </h2>
                    <div className="space-y-4">
                        {experiences.map((exp, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {exp.position}
                                        </h3>
                                        <p className="text-sm text-gray-700 font-medium">
                                            {exp.company}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-600 text-right">
                                        <p>
                                            {new Date(exp.startDate).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })} - {exp.endDate 
                                                ? new Date(exp.endDate).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })
                                                : "Present"
                                            }
                                        </p>
                                    </div>
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-gray-700 mb-2 leading-tight">
                                        {exp.description}
                                    </p>
                                )}
                                {exp.skillsLearned && exp.skillsLearned.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {exp.skillsLearned.map((skill, skillIdx) => (
                                            <Badge 
                                                key={skillIdx} 
                                                variant="secondary" 
                                                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-0"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects Section */}
            {projects && projects.length > 0 && (
                <div className="px-6 py-4 print:px-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        PROJECTS
                    </h2>
                    <div className="space-y-4">
                        {projects.map((project, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {project.title}
                                    </h3>
                                    {project.link && (
                                        <a 
                                            href={project.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center print:text-gray-600"
                                        >
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                                            </svg>
                                            View Project
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 mb-2 leading-tight">
                                    {project.description}
                                </p>
                                {project.techStack && project.techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        <span className="text-xs text-gray-600 mr-1">Technologies:</span>
                                        {project.techStack.map((tech, techIdx) => (
                                            <Badge 
                                                key={techIdx} 
                                                variant="outline" 
                                                className="text-xs border-gray-300 text-gray-700 px-2 py-0"
                                            >
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills Section */}
            {skills && skills.length > 0 && (
                <div className="px-6 py-4 print:px-0">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        TECHNICAL SKILLS
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {skills.map((skill, idx) => (
                            <div 
                                key={idx} 
                                className="bg-gray-50 px-3 py-1 rounded text-center text-sm text-gray-800 font-medium border"
                            >
                                {skill.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state messages */}
            {(!education || education.length === 0) && (
                <div className="px-6 py-4 print:px-0 print:hidden">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        EDUCATION
                    </h2>
                    <p className="text-sm text-gray-500">
                        No education information added.{" "}
                        <Link to="/dashboard" className="text-blue-600 underline hover:text-blue-800">
                            Add now
                        </Link>
                    </p>
                </div>
            )}

            {(!experiences || experiences.length === 0) && (
                <div className="px-6 py-4 print:px-0 print:hidden">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        PROFESSIONAL EXPERIENCE
                    </h2>
                    <p className="text-sm text-gray-500">
                        No experiences added.{" "}
                        <Link to="/dashboard" className="text-blue-600 underline hover:text-blue-800">
                            Add now
                        </Link>
                    </p>
                </div>
            )}

            {(!projects || projects.length === 0) && (
                <div className="px-6 py-4 print:px-0 print:hidden">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        PROJECTS
                    </h2>
                    <p className="text-sm text-gray-500">
                        No projects added.{" "}
                        <Link to="/dashboard" className="text-blue-600 underline hover:text-blue-800">
                            Add now
                        </Link>
                    </p>
                </div>
            )}

            {(!skills || skills.length === 0) && (
                <div className="px-6 py-4 print:px-0 print:hidden">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300 tracking-wider">
                        TECHNICAL SKILLS
                    </h2>
                    <p className="text-sm text-gray-500">
                        No skills added.{" "}
                        <Link to="/dashboard" className="text-blue-600 underline hover:text-blue-800">
                            Add now
                        </Link>
                    </p>
                </div>
            )}

            {/* Footer - hidden in print */}
            <div className="px-6 pb-4 text-center text-xs text-gray-500 print:hidden">
                Generated from Portfolio Dashboard
            </div>
        </div>
    );
}