import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { ReactNode } from "react";

export const HostShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        {children}
      </motion.main>
    </div>
  );
};
