import { deploymentEnv, type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig ={
    crons: [
        {
           path: '/api/cron/cleanup?secret=${deploymentEnv("CRON_SECRET")}',
           schedule: "0 3 * * *",
        },
    ],
};