import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Signup() {
    return(
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                    Enter your email and password to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                        />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" required />
                        </div>
                    </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:bg-blue-700">
                    Sign Up
                    </Button>
                    <p className="text-sm text-center mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}