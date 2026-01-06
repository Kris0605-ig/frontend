import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    CircularProgress,
    Box,
    Grid,
    Avatar,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { authProvider } from "./authProvider";

export const Dashboard = () => {
    const [authStatus, setAuthStatus] = useState("Checking...");

    useEffect(() => {
        // ✅ Thêm {} làm tham số để tránh lỗi TypeScript
        authProvider.checkAuth({})
            .then(() => setAuthStatus("Authenticated"))
            .catch(() => setAuthStatus("Not Authenticated"));
    }, []);

    return (
        <Grid container justifyContent="center" style={{ marginTop: 50 }}>
            <Grid item xs={12} md={8} lg={6}>
                <Card
                    style={{
                        borderRadius: 16,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    }}
                    sx={{
                        background: `linear-gradient(135deg, ${blue[500]} 30%, ${blue[300]} 90%)`,
                        color: "white",
                    }}
                >
                    <CardHeader
                        avatar={
                            <Avatar
                                sx={{
                                    bgcolor: "white",
                                    color: blue[500],
                                }}
                            >
                                A
                            </Avatar>
                        }
                        title="Welcome to the Administration"
                        titleTypographyProps={{ variant: "h5", fontWeight: "bold" }}
                    />
                    <CardContent>
                        <Typography variant="body1" style={{ marginBottom: 16 }}>
                            Welcome to the administration panel. Here, you can manage
                            content, monitor activities, and customize settings to ensure
                            the system runs efficiently.
                        </Typography>

                        {authStatus === "Checking..." ? (
                            <Box display="flex" alignItems="center">
                                <CircularProgress
                                    size={24}
                                    style={{ color: "white", marginRight: 8 }}
                                />
                                <Typography variant="body2">
                                    Checking authentication...
                                </Typography>
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                style={{ fontWeight: "bold", textAlign: "center" }}
                            >
                                {authStatus}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};
