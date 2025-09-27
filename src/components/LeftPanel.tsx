import { Box, IconButton, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
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
  const open = useScheduleStore((s) => s.leftOpen);
  const width = useScheduleStore((s) => s.leftWidth);
  const toggle = useScheduleStore((s) => s.toggleLeft);
  const setWidth = useScheduleStore((s) => s.setLeftWidth);
  const tree = useMemo(() => buildTree(data?.activities ?? []), [data]);

  if (!open) {
    return (
      <Box
        width={28}
        bgcolor="#ecf0f1"
        borderRight="2px solid #bdc3c7"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ boxSizing: "border-box" }}
      >
        <IconButton
          size="small"
          onClick={toggle}
          aria-label="Open activity list"
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      width={width}
      bgcolor="#ecf0f1"
      display="flex"
      flexDirection="column"
      borderRight="2px solid #bdc3c7"
      sx={{ boxSizing: "border-box", position: "relative" }}
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
        <IconButton
          size="small"
          onClick={toggle}
          aria-label="Close activity list"
          sx={{ color: "#fff" }}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>
      {/* Resizer handle on the right edge of the panel */}
      <Box
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startW = width;
          function onMove(ev: MouseEvent) {
            setWidth(startW + (ev.clientX - startX));
          }
          function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          }
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp, { once: true });
        }}
        sx={{
          position: "absolute",
          right: -4,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: "col-resize",
          zIndex: 2,
        }}
      />
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
