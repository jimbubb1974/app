import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useScheduleStore } from "../state/useScheduleStore";
import type { Activity } from "../types/schedule";

type TreeNode = {
  name: string;
  children?: TreeNode[];
  activities?: Activity[];
};

function buildTree(activities: Activity[]): TreeNode[] {
  const root: Record<string, TreeNode> = {};
  for (const act of activities) {
    const path =
      act.wbsPath && act.wbsPath.length ? act.wbsPath : ["Ungrouped"];
    let currentLevel = root;
    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (!currentLevel[key])
        currentLevel[key] = { name: key, children: [], activities: [] };
      if (i === path.length - 1) {
        currentLevel[key].activities?.push(act);
      } else {
        // dive deeper
        const nextLevel: Record<string, TreeNode> = {};
        if (!currentLevel[key].children) currentLevel[key].children = [];
        // Mapify children for quick access
        const map: Record<string, TreeNode> = {};
        for (const child of currentLevel[key].children!)
          map[child.name] = child;
        currentLevel = map;
        // Ensure currentLevel is kept in sync with children array on next insert
        // For Tier 1 simplicity, we rebuild per activity; acceptable for small sets.
      }
    }
  }
  return Object.values(root);
}

export function LeftPanel() {
  const data = useScheduleStore((s) => s.data);
  const tree = useMemo(() => buildTree(data?.activities ?? []), [data]);

  return (
    <Box
      width={280}
      bgcolor="#ecf0f1"
      display="flex"
      flexDirection="column"
      borderRight="2px solid #bdc3c7"
    >
      <Box
        px={1.5}
        py={0.75}
        bgcolor="#34495e"
        color="#fff"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Activity List
        </Typography>
        <Box component="span">⚙</Box>
      </Box>
      <Box flex={1} overflow="auto" p={1}>
        {tree.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Import a file to see activities.
          </Typography>
        )}
        {tree.map((group) => (
          <Box key={group.name} mb={2} position="relative">
            <Box
              position="absolute"
              left={-5}
              top={0}
              width={20}
              height="100%"
              bgcolor="#34495e"
              color="#fff"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="3px 0 0 3px"
              sx={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {group.name}
            </Box>
            <Box
              ml={3}
              p={1}
              bgcolor="rgba(52,73,94,0.05)"
              borderRadius="0 3px 3px 0"
            >
              {group.activities?.map((a) => (
                <Box
                  key={a.id}
                  px={1}
                  py={0.5}
                  my={0.5}
                  bgcolor="#fff"
                  borderLeft="3px solid #3498db"
                  borderRadius={1}
                  fontSize={12}
                >
                  <div>{a.name}</div>
                  <div style={{ color: "#7f8c8d", fontSize: 10 }}>
                    {a.durationDays ?? ""}
                  </div>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
