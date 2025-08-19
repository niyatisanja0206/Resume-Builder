import { Link } from 'react-router-dom';
import { useUserContext } from '@/hooks/useUserContext';
import Profile from './Profile';
import { Button } from '@/components/ui/button';

export default function Header() {
    const { currentUser, logout } = useUserContext();
    const isAuthenticated = !!currentUser;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                {/* Logo/Brand */}
                <div className="flex items-center space-x-2">
                    <Link 
                    to="/" 
                    className="group flex items-center space-x-2 text-xl font-semibold text-foreground hover:text-primary transition-colors"
                    >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="hidden sm:block">My Portfolio</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex items-center space-x-1">
                    <Link
                    to="/portfolio"
                    className="relative px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group"
                    >
                    <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4" />
                        </svg>
                        <span>Templates</span>
                    </span>
                    {/* Active indicator */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </Link>

                    <Link
                    to="/dashboard"
                    className="relative px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors group"
                    >
                    <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Dashboard</span>
                    </span>
                    {/* Active indicator */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                    </Link>

                    {/* Authentication Section */}
                    {isAuthenticated && currentUser ? (
                        <div className="ml-4">
                            <Profile 
                                userEmail={currentUser.email} 
                                onLogout={logout ?? (() => {})}
                                onDeleteAccount={logout ?? (() => {})}
                            />
                        </div>
                    ) : (
                        <div className="ml-4 flex items-center space-x-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="sm">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
                </div>
            </div>
        </header>
    );
}
