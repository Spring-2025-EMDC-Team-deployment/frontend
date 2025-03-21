import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Button, Container } from "@mui/material";
import { useState } from "react";
import JudgeModal from "../Modals/JudgeModal";
import { useNavigate } from "react-router-dom";
import { useMapClusterJudgeStore } from "../../store/map_stores/mapClusterToJudgeStore";
import { useJudgeStore } from "../../store/primary_stores/judgeStore";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ClusterModal from "../Modals/ClusterModal";
import { Cluster, Judge, JudgeData } from "../../types";
import AreYouSureModal from "../Modals/AreYouSureModal";

interface IJudgesTableProps {
  judges: any[];
  clusters: any[];
  contestid: number;
}

interface IOrganizerClustersTeamsTableProps {
  clusters: any[];
  judgesByClusterId: {
    [key: number]: Judge[];
  };
  contestid: number;
}

function createDataJudge(
  name: string,
  role: string,
  editJudge: any,
  cluster: string,
  scoreSheets: any[],
  viewEditScores: any,
  deleteJudge: any,
  isAllSheetsSubmited: boolean
) {
  return {
    name,
    role,
    editJudge,
    cluster,
    scoreSheets,
    viewEditScores,
    deleteJudge,
    isAllSheetsSubmited,
  };
}

function JudgeRow(props: { row: ReturnType<typeof createDataJudge> }) {
  const { row } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ mt: 0 }} onClick={() => setOpen(!open)}>
        <TableCell>
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.role}
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell scope="row">
          {row.isAllSheetsSubmited ? (
            <CheckIcon sx={{ color: "green" }} />
          ) : (
            <CloseIcon sx={{ color: "red" }} />
          )}
        </TableCell>
        <TableCell align="right">
          <Container sx={{ paddingBottom: 0, paddingTop: 0, gap: 3 }}>
            {row.viewEditScores}
            {row.editJudge}
            {row.deleteJudge}
          </Container>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Cluster(s)</TableCell>
                  <TableCell align="left">{row.cluster}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Score Sheets</TableCell>
                  <TableCell align="left">
                    {row.scoreSheets.map((value, index) => (
                      <Typography
                        key={index}
                        component="span"
                        style={{ display: "inline" }}
                      >
                        {value}
                        {index < row.scoreSheets.length - 1 ? ", " : ""}
                      </Typography>
                    ))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function JudgesTable(props: IJudgesTableProps) {
  const { judges, clusters, contestid } = props;
  const navigate = useNavigate();
  const [openJudgeModal, setOpenJudgeModal] = useState(false);
  const [openAreYouSure, setOpenAreYouSure] = useState(false);
  const [judgeData, setJudgeData] = useState<JudgeData | undefined>(undefined);
  const { submissionStatus } = useJudgeStore();
  const [judgeId, setJudgeId] = useState(0);
  const { fetchJudgesByClusterId } = useMapClusterJudgeStore();

  const { judgeClusters } = useMapClusterJudgeStore();
  const { deleteJudge, judgeError } = useJudgeStore();

  const titles = ["Lead", "Technical", "General", "Journal"];

  const handleOpenJudgeModal = (judgeData: JudgeData) => {
    setJudgeData(judgeData);
    setOpenJudgeModal(true);
  };

  const handleOpenAreYouSure = (judgeId: number) => {
    setJudgeId(judgeId);
    setOpenAreYouSure(true);
  };

  const handleDelete = async (judgeId: number) => {
    await deleteJudge(judgeId);
    await fetchJudgesByClusterId(judgeClusters[judgeId].id);
  };

  const handleCloseJudgeModal = () => {
    setOpenJudgeModal(false);
  };

  const getScoreSheets = (judge: any) => {
    const scoreSheets = [];
    if (judge.journal) scoreSheets.push("Journal");
    if (judge.presentation) scoreSheets.push("Presentation");
    if (judge.mdo) scoreSheets.push("Machine Design & Operation");
    if (judge.otherpenalties) scoreSheets.push("General Penalties");
    if (judge.runpenalties) scoreSheets.push("Run Penalties");

    return scoreSheets;
  };

  // Populate table with store data
  const rows = judges.map((judge) =>
    createDataJudge(
      `${judge.first_name} ${judge.last_name}`,
      `${titles[judge.role - 1]}`,
      <Button
        variant="outlined"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenJudgeModal({
            id: judge.id,
            firstName: judge.first_name,
            lastName: judge.last_name,
            cluster: judgeClusters[judge.id],
            role: judge.role,
            journalSS: judge.journal,
            presSS: judge.presentation,
            mdoSS: judge.mdo,
            runPenSS: judge.runpenalties,
            genPenSS: judge.otherpenalties,
            phoneNumber: judge.phone_number,
          });
        }}
      >
        Edit Judge
      </Button>,
      judgeClusters[judge.id]?.cluster_name,
      getScoreSheets(judge),
      <Button
        variant="outlined"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/judging/${judge.id}/`);
        }}
        sx={{ mr: 2 }}
      >
        View/Edit Scores
      </Button>,
      <Button
        variant="outlined"
        sx={{ ml: 2 }}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenAreYouSure(judge.id);
        }}
      >
        Delete
      </Button>,
      submissionStatus ? submissionStatus[judge.id] : false
    )
  );

  return (
    <TableContainer component={Box}>
      <Table aria-label="collapsible table">
        <TableBody>
          {rows.map((row, index) => (
            <JudgeRow key={index} row={row} />
          ))}
        </TableBody>
      </Table>
      <JudgeModal
        open={openJudgeModal}
        handleClose={handleCloseJudgeModal}
        mode="edit"
        clusters={clusters}
        judgeData={judgeData}
        contestid={contestid}
      />
      <AreYouSureModal
        open={openAreYouSure}
        handleClose={() => setOpenAreYouSure(false)}
        title="Are you sure you want to delete this judge?"
        handleSubmit={() => handleDelete(judgeId)}
        error={judgeError}
      />
    </TableContainer>
  );
}

export default function OrganizerJudgesTable(
  props: IOrganizerClustersTeamsTableProps
) {
  const { clusters, judgesByClusterId, contestid } = props;
  const [openClusterIds, setOpenClusterIds] = useState<number[]>([]);
  const [openClusterModal, setOpenClusterModal] = useState(false);
  const [clusterData, setClusterData] = useState<Cluster | undefined>(
    undefined
  );

  const handleToggleRow = (clusterId: number) => {
    setOpenClusterIds((prevIds) =>
      prevIds.includes(clusterId)
        ? prevIds.filter((id) => id !== clusterId)
        : [...prevIds, clusterId]
    );
  };

  const handleCloseModal = (type: string) => {
    if (type === "cluster") {
      setOpenClusterModal(false);
    }
  };

  const handleOpenModal = (type: string, clusterData: Cluster) => {
    if (type === "cluster") {
      setOpenClusterModal(true);
      setClusterData(clusterData);
    }
  };

  return (
    <TableContainer component={Box}>
      <Table aria-label="collapsible table">
        <TableBody>
          {clusters.map((cluster) => (
            <React.Fragment key={cluster.id}>
              <TableRow onClick={() => handleToggleRow(cluster.id)}>
                <TableCell>
                  <IconButton size="small">
                    {openClusterIds.includes(cluster.id) ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                  {cluster.cluster_name}
                </TableCell>
                <TableCell align="right">
                  {cluster.cluster_name != "All Teams" && (
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal("cluster", {
                          cluster_name: cluster.cluster_name,
                          id: cluster.id,
                        });
                      }}
                    >
                      Edit Cluster
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  style={{ paddingBottom: 0, paddingTop: 0 }}
                  colSpan={5}
                >
                  <Collapse
                    in={openClusterIds.includes(cluster.id)}
                    timeout="auto"
                    unmountOnExit
                  >
                    <JudgesTable
                      judges={judgesByClusterId[cluster.id]}
                      clusters={clusters}
                      contestid={contestid}
                    ></JudgesTable>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      <ClusterModal
        open={openClusterModal}
        handleClose={() => handleCloseModal("cluster")}
        mode="edit"
        clusterData={clusterData}
      />
    </TableContainer>
  );
}
