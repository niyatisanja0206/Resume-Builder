import { Button } from "@/components/ui/button";
import { User, LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface ProfileProps {
  userEmail: string;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function Profile({ userEmail, onLogout, onDeleteAccount }: ProfileProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Clean up temporary resume data before logout
        await fetch('/api/resume/temporary', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail })
        });

        // Call logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage and redirect even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onLogout();
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/auth/delete', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            onDeleteAccount();
            navigate('/');
            alert('Account deleted successfully');
          } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
          }
        }
      } catch (error) {
        console.error('Delete account error:', error);
        alert('Error deleting account');
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => setShowMenu(!showMenu)}
      >
        <User className="h-4 w-4" />
      </Button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-50">
          <div className="px-4 py-2 text-sm font-medium text-foreground border-b border-border">
            {userEmail}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}
