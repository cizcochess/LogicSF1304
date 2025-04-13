import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cva } from "class-variance-authority";

const iconVariants = cva(
  "rounded-full h-12 w-12 flex items-center justify-center text-white mr-4",
  {
    variants: {
      color: {
        blue: "bg-primary",
        green: "bg-green-500",
        orange: "bg-amber-500",
        purple: "bg-indigo-500",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  }
);

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: ReactNode;
  color?: "blue" | "green" | "orange" | "purple";
  trend?: {
    value: string;
    direction?: "up" | "down" | "neutral";
  };
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  color = "blue",
  trend,
}: StatCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 flex items-center">
        <div className={iconVariants({ color })}>{icon}</div>
        <div>
          <h2 className="text-sm text-gray-500 font-medium">{title}</h2>
          <p className="text-2xl font-semibold">{value}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
          {trend && (
            <p
              className={`text-xs flex items-center ${
                trend.direction === "up"
                  ? "text-green-500"
                  : trend.direction === "down"
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {trend.value}
              {trend.direction === "up" && (
                <i className="fas fa-arrow-up ml-1"></i>
              )}
              {trend.direction === "down" && (
                <i className="fas fa-arrow-down ml-1"></i>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
