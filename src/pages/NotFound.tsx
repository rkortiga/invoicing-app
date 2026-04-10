import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";

const NotFound = () => {
    const location = useLocation();

    return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
            <Card className="w-full">
                <CardHeader className="text-center">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        404
                    </p>
                    <CardTitle className="text-3xl">Page not found</CardTitle>
                    <CardDescription>
                        We couldn't find <span className="font-mono text-foreground">{location.pathname}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button asChild>
                        <Link to="/">Back to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotFound;
