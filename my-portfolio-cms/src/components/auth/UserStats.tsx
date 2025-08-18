import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStats } from "@/hooks/useUserStats";

export default function UserStats() {
    const { stats, isLoading } = useUserStats();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Your Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Your Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                            {stats.no_of_resumes}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Resumes Created
                        </div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {stats.resume_downloaded}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Resumes Downloaded
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground text-center">
                    Statistics are updated automatically when you create or download resumes
                </div>
            </CardContent>
        </Card>
    );
}
