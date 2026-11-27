import {useEffect, useState} from "react";
import {
  Accordion,AccordionDetails,AccordionSummary,Alert,AppBar,Avatar,Box,
  Button,Card,CardContent,Chip,CircularProgress,Container,Divider,FormControl,Grid,
  InputLabel,LinearProgress,MenuItem,Paper,Select,Stack,Tab,Tabs,TextField,Typography
} from "@mui/material";
import {
  AutoAwesome,CloudUpload,Dashboard as DashboardIcon,Groups,CalendarMonth,PictureAsPdf,
  TableChart,History,RateReview,ExpandMore,CheckCircle,Flag,Lightbulb,Insights,EventAvailable
} from "@mui/icons-material";
import {
  uploadExcel,getClients,generateRoadmap,generateMonthlyPlan,generateWeeklyPlan,
  getRoadmap,getMonthlyPlan,getWeeklyPlan,regeneratePlan,getPlanVersions,
  submitCoachReview,getCoachReviews,downloadReport
} from "./services/api";

function extractArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.clients)) return result.clients;
  if (Array.isArray(result?.data?.clients)) return result.data.clients;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.results)) return result.results;
  return [];
}

function extractData(result) {
  let data = result?.data ?? result;
  // Handle APIs that wrap the actual object more than once.
  while (
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    data = data.data;
  }

  return data;
}

function getMonthName(monthNumber) {
  return (
    [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ][Number(monthNumber) - 1] || `Month ${monthNumber}`
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <Card elevation={0} sx={{ height: "100%", border: "1px solid #E6EBF1", borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Avatar sx={{ bgcolor: "#EAF2FB", color: "#315C81" }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function InfoCard({ title, items, icon, color }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: `${color}18`, color }}>
            {icon}
          </Avatar>
          <Typography fontWeight={700}>{title}</Typography>
        </Stack>

        {Array.isArray(items) && items.length > 0 ? (
          <Stack spacing={1}>
            {items.map((item, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="flex-start">
                <CheckCircle sx={{ fontSize: 17, color, mt: "3px" }} />
                <Typography variant="body2">{item}</Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No information available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function RoadmapViewer({ value, onGenerateMonthly }) {
  if (!value) return null;

  const data = extractData(value);
  const assessment = data?.assessment || {};
  const roadmap = data?.yearlyRoadmap || {};
  const phases = roadmap?.phases || [];
  const review = data?.review || {};

  const allMonths = phases.flatMap((phase) =>
    (phase.months || []).map((month) => ({
      ...month,
      phaseName: phase.phaseName
    }))
  );

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      {/* HERO HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          color: "#FFFFFF",
          background: "linear-gradient(120deg, #183B56 0%, #287A78 100%)"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          spacing={2}
        >
          <Box>
            <Chip
              label={data.status?.replaceAll("_", " ") || "Generated roadmap"}
              size="small"
              sx={{
                mb: 1.5,
                bgcolor: "rgba(255,255,255,0.18)",
                color: "#FFFFFF",
                textTransform: "capitalize"
              }}
            />
            <Typography variant="h4" fontWeight={800}>
              2027 Transformation Journey
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.85 }}>
              Client ID: {data.clientId ?? "Not available"}
            </Typography>
          </Box>

          <Avatar
            sx={{
              width: 68,
              height: 68,
              bgcolor: "rgba(255,255,255,0.18)"
            }}
          >
            <AutoAwesome sx={{ fontSize: 36 }} />
          </Avatar>
        </Stack>

        <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.25)" }} />

        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          YOUR YEAR THEME
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {roadmap.yearTheme || "Your transformation theme"}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 2 }}
        >
          <Chip
            icon={<CalendarMonth />}
            label={`${allMonths.length || 12} Months`}
            sx={{ bgcolor: "#FFFFFF", fontWeight: 600 }}
          />
          <Chip
            icon={<Flag />}
            label={`${phases.length} Phases`}
            sx={{ bgcolor: "#FFFFFF", fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {/* ASSESSMENT */}
      <Box>
        <SectionTitle
          icon={<Insights />}
          title="Initial Assessment"
          subtitle="An overview of the starting point and development opportunities"
        />

        <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Typography color="text.secondary" variant="overline">
              OVERVIEW
            </Typography>
            <Typography sx={{ lineHeight: 1.8 }}>
              {assessment.overview || "No overview available."}
            </Typography>

            {assessment.startingPoint && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#F3F7FB", borderRadius: 2 }}>
                <Typography fontWeight={700} gutterBottom>
                  Starting Point
                </Typography>
                <Typography variant="body2">
                  {assessment.startingPoint}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Strengths"
              items={assessment.strengths}
              icon={<CheckCircle />}
              color="#21966B"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Development Opportunities"
              items={assessment.opportunities}
              icon={<Lightbulb />}
              color="#D28B32"
            />
          </Grid>
        </Grid>
      </Box>

      {/* PHASE TIMELINE */}
      <Box>
        <SectionTitle
          icon={<Flag />}
          title="Your 4 Transformation Phases"
          subtitle="A year-long journey divided into manageable stages"
        />

        <Grid container spacing={2}>
          {phases.map((phase, index) => {
            const startMonth = phase.months?.[0]?.month;
            const endMonth = phase.months?.[phase.months.length - 1]?.month;

            return (
              <Grid item xs={12} md={6} key={`${phase.phaseName}-${index}`}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    borderTop: "4px solid",
                    borderTopColor: ["#315C81", "#269B83", "#8B70B8", "#D28B32"][index % 4]
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {String(index + 1).padStart(2, "0")} · {phase.phaseName}
                      </Typography>
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={
                          startMonth && endMonth
                            ? `Months ${startMonth}–${endMonth}`
                            : `${phase.months?.length || 0} months`
                        }
                      />
                    </Stack>

                    <Typography color="text.secondary" variant="body2" sx={{ mt: 1.5 }}>
                      {phase.phaseOutcome || "Phase outcome not provided."}
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        mt: 2,
                        height: 6,
                        borderRadius: 5,
                        bgcolor: "#EDF1F5"
                      }}
                    />

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      {phase.months?.length || 0} monthly milestones
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* MONTHLY CARDS */}
      <Box>
        <SectionTitle
          icon={<CalendarMonth />}
          title="Explore Your Monthly Roadmap"
          subtitle="Expand a month to see its habits and reflection prompt"
        />

        <Grid container spacing={2}>
          {allMonths
            .sort((a, b) => Number(a.month) - Number(b.month))
            .map((month, index) => (
              <Grid item xs={12} sm={6} md={4} key={month.month ?? index}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    transition: "0.2s",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: "#EAF2FB",
                          color: "#315C81",
                          fontWeight: 700
                        }}
                      >
                        {String(month.month).padStart(2, "0")}
                      </Avatar>
                      <Chip size="small" label={month.phaseName || "Roadmap"} />
                    </Stack>

                    <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                      {month.theme || getMonthName(month.month)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {getMonthName(month.month)}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Key habits
                    </Typography>

                    <Stack spacing={0.8}>
                      {(month.habits || []).map((habit, habitIndex) => (
                        <Stack key={habitIndex} direction="row" spacing={1} alignItems="flex-start">
                          <CheckCircle sx={{ fontSize: 16, color: "success.main", mt: "2px" }} />
                          <Typography variant="body2">{habit}</Typography>
                        </Stack>
                      ))}
                    </Stack>

                    {month.objectives?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Main objectives</Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          {month.objectives.map((objective, objectiveIndex) => (
                            <Typography key={objectiveIndex} variant="body2">
                              • {objective}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {(month.relatedPrimaryGoal || month.relatedSecondaryGoal) && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Primary goal:</strong> {month.relatedPrimaryGoal || "Not specified"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Secondary goal:</strong> {month.relatedSecondaryGoal || "Not specified"}
                        </Typography>
                      </Box>
                    )}

                    {month.expectedOutcomes?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Expected non-clinical outcomes</Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          {month.expectedOutcomes.map((outcome, outcomeIndex) => (
                            <Typography key={outcomeIndex} variant="body2">
                              • {outcome}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {month.reflectionPrompt && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: "#F5F8FC", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          REFLECTION
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
                          “{month.reflectionPrompt}”
                        </Typography>
                      </Box>
                    )}

                    {onGenerateMonthly && (
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => onGenerateMonthly(Number(month.month))}
                      >
                        Generate Monthly Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>

        {allMonths.length === 0 && (
          <Alert severity="warning">
            No monthly roadmap entries were returned by the API.
          </Alert>
        )}
      </Box>

      {/* COACH REVIEW */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          bgcolor: review.reviewRequired ? "#FFF9ED" : "#F0FAF5",
          borderColor: review.reviewRequired ? "#F1D49A" : "#B9E2CC"
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <RateReview color={review.reviewRequired ? "warning" : "success"} />
            <Typography variant="h6" fontWeight={700}>
              Coach Review
            </Typography>
            <Chip
              size="small"
              color={review.reviewRequired ? "warning" : "success"}
              label={review.reviewRequired ? "Review required" : "Not required"}
            />
          </Stack>

          {review.reviewReason && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {review.reviewReason}
            </Typography>
          )}

          {review.coachNotes && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Coach note: {review.coachNotes}
            </Typography>
          )}
        </CardContent>
      </Card>

      {data.disclaimer && (
        <Alert severity="info">{data.disclaimer}</Alert>
      )}

      {data.generatedAt && (
        <Typography variant="caption" color="text.secondary" textAlign="right">
          Generated: {new Date(data.generatedAt).toLocaleString()}
        </Typography>
      )}
    </Stack>
  );
}

// ----------------------------------------------------
// MONTHLY / WEEKLY PLAN VIEWER
// ----------------------------------------------------

function PlanViewer({ title, value }) {
  if (!value) return null;

  const data = extractData(value);

  // Yearly plans use the dedicated visual dashboard.
  if (data?.yearlyRoadmap) {
    return <RoadmapViewer value={data} />;
  }

  const weeklyPlans = data?.weeklyPlans || [];
  const dailyPlans = data?.dailyPlans || [];
  const habits = data?.suggestedHabits || [];
  const focus = data?.monthlyFocus || [];
  const roadmapObjectives = data?.roadmapObjectives || [];

  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          color: "#FFFFFF",
          background: "linear-gradient(120deg, #183B56 0%, #287A78 100%)"
        }}
      >
        <Chip
          label="Generated plan"
          size="small"
          sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#FFFFFF", mb: 1 }}
        />
        <Typography variant="h5" fontWeight={800}>
          {data.monthName || data.weekTheme || title}
        </Typography>
        <Typography sx={{ mt: 1, opacity: 0.9 }}>
          {data.monthlyOverview || data.weeklyOverview || "Your planning details"}
        </Typography>
      </Paper>

      {focus.length > 0 && (
        <InfoCard
          title="Monthly Focus"
          items={focus}
          icon={<Flag />}
          color="#315C81"
        />
      )}

      {roadmapObjectives.length > 0 && (
        <InfoCard
          title={`Roadmap Alignment · ${data.roadmapTheme || "Monthly theme"}`}
          items={[
            `Primary goal: ${data.relatedPrimaryGoal || "Not specified"}`,
            `Secondary goal: ${data.relatedSecondaryGoal || "Not specified"}`,
            ...roadmapObjectives
          ]}
          icon={<Flag />}
          color="#315C81"
        />
      )}

      {data.continuityNote && (
        <Alert severity="info">{data.continuityNote}</Alert>
      )}

      {data.professionalReviewRequired && (
        <Alert severity="warning">
          Professional review required. {data.professionalReviewReason}
        </Alert>
      )}

      {habits.length > 0 && (
        <InfoCard
          title="Suggested Habits"
          items={habits}
          icon={<CheckCircle />}
          color="#21966B"
        />
      )}

      {(weeklyPlans.length > 0 || dailyPlans.length > 0) && (
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            {dailyPlans.length > 0 ? "Daily Plan" : "Weekly Plan"}
          </Typography>

          {(dailyPlans.length > 0 ? dailyPlans : weeklyPlans).map((item, index) => (
            <Accordion key={index} variant="outlined" sx={{ borderRadius: "12px !important", mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={700}>
                  {item.day || item.weekName || `Week ${item.week || index + 1}`}
                  {item.theme ? ` · ${item.theme}` : ""}
                  {item.focus ? ` · ${item.focus}` : ""}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {item.overview && <Typography>{item.overview}</Typography>}
                  {item.focus && <Typography>{item.focus}</Typography>}
                  {(item.suggestedHabits || item.habits || []).map((habit, habitIndex) => (
                    <Typography key={habitIndex} variant="body2">
                      • {habit}
                    </Typography>
                  ))}
                  {item.reflectionPrompt && (
                    <Alert severity="info">{item.reflectionPrompt}</Alert>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {data.monthlyMilestones?.length > 0 && (
        <InfoCard
          title="Monthly Milestones"
          items={data.monthlyMilestones}
          icon={<Flag />}
          color="#D28B32"
        />
      )}

      {data.weeklyMilestones?.length > 0 && (
        <InfoCard
          title="Weekly Milestones"
          items={data.weeklyMilestones}
          icon={<Flag />}
          color="#D28B32"
        />
      )}

      {data.endOfMonthReflection?.length > 0 && (
        <InfoCard
          title="End-of-Month Reflection"
          items={data.endOfMonthReflection}
          icon={<Insights />}
          color="#8B70B8"
        />
      )}

      {data.endOfWeekReflection?.length > 0 && (
        <InfoCard
          title="End-of-Week Reflection"
          items={data.endOfWeekReflection}
          icon={<Insights />}
          color="#8B70B8"
        />
      )}

      {data.disclaimer && <Alert severity="info">{data.disclaimer}</Alert>}

      {!data.monthlyOverview && !data.weeklyOverview &&
        !data.monthlyFocus && !data.weeklyPlans && !data.dailyPlans && (
          <Alert severity="warning">
            The API returned a plan structure that this viewer does not recognize.
            Check the response fields from your backend.
          </Alert>
        )}
    </Stack>
  );
}

function validateClientDetails(client) {
  const errors = {};

  if (!client) {
    return { general: "Please select a client." };
  }

  if (!client.name || String(client.name).trim().length < 2) {
    errors.name = "Client name is required.";
  }

  if (!client.dob || !isValidDate(client.dob)) {
    errors.dob = "Enter a valid date of birth.";
  } else if (new Date(`${client.dob}T00:00:00Z`) > new Date()) {
    errors.dob = "Date of birth cannot be in the future.";
  }

  const height = Number(client.height_cm);
  if (
    client.height_cm === "" ||
    client.height_cm == null ||
    !Number.isFinite(height) ||
    height <= 0 ||
    height > 300
  ) {
    errors.height_cm = "Enter a valid height in centimetres.";
  }

  const weight = Number(client.weight_kg);
  if (
    client.weight_kg === "" ||
    client.weight_kg == null ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    weight > 500
  ) {
    errors.weight_kg = "Enter a valid weight in kilograms.";
  }

  [
    ["primary_goal_1", "Primary Goal 1"],
    ["primary_goal_2", "Primary Goal 2"],
    ["secondary_goal_1", "Secondary Goal 1"],
    ["secondary_goal_2", "Secondary Goal 2"]
  ].forEach(([field, label]) => {
    const goal = String(client[field] || "").trim();
    if (goal.length < 2 || goal.toLowerCase() === "not specified") {
      errors[field] = `${label} is required. Update this client using the four-goal Excel template.`;
    }
  });

  if (client.legacyGoalMigrationRequired) {
    errors.legacyGoalMigrationRequired =
      "This client was imported from a legacy workbook. Add all four goals in the current Excel template.";
  }

  if (!client.activity_level || String(client.activity_level).trim().length < 2) {
    errors.activity_level = "Activity level is required.";
  }

  if (!client.target_date || !isValidDate(client.target_date)) {
    errors.target_date = "Enter a valid target date.";
  }

  return errors;
}

function isValidDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function ClientProfileCard({ client, errors }) {
  if (!client) {
    return (
      <Alert severity="info">
        Select a client to view their profile and validate their details.
      </Alert>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  const details = [
    {
      label: "Client ID",
      value: client.client_id ?? client.id ?? "N/A"
    },
    {
      label: "Height",
      value: client.height_cm ? `${client.height_cm} cm` : "Not provided"
    },
    {
      label: "Weight",
      value: client.weight_kg ? `${client.weight_kg} kg` : "Not provided"
    },
    {
      label: "Date of Birth",
      value: client.dob || "Not provided"
    },
    {
      label: "Activity Level",
      value: client.activity_level || "Not provided"
    },
    {
      label: "Primary Goal 1",
      value: client.primary_goal_1 || "Not provided"
    },
    {
      label: "Primary Goal 2",
      value: client.primary_goal_2 || "Not provided"
    },
    {
      label: "Secondary Goal 1",
      value: client.secondary_goal_1 || "Not provided"
    },
    {
      label: "Secondary Goal 2",
      value: client.secondary_goal_2 || "Not provided"
    },
    {
      label: "Workout Preference",
      value: client.workout_preference || "Not provided"
    },
    {
      label: "Available Time",
      value: client.available_workout_time || "Not provided"
    }
  ];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #DFE7F0",
        borderRadius: 4,
        overflow: "hidden"
      }}
    >
      <Box
        sx={{
          p: 2.5,
          background: "linear-gradient(120deg, #183B56, #287A78)",
          color: "white"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 55,
                height: 55,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: 22
              }}
            >
              {client.name?.charAt(0)?.toUpperCase() || "C"}
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight={700}>
                {client.name || "Unnamed Client"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Client Profile · ID {client.client_id ?? client.id}
              </Typography>
            </Box>
          </Stack>

          <Chip
            icon={hasErrors ? undefined : <CheckCircle />}
            label={hasErrors ? "Details need attention" : "Details validated"}
            color={hasErrors ? "warning" : "success"}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Client Information
        </Typography>

        <Grid container spacing={2}>
          {details.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  height: "100%",
                  borderRadius: 2,
                  bgcolor: "#FAFCFE"
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {item.label}
                </Typography>

                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                >
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {hasErrors && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>
              Please correct the following details before generating a plan:
            </Typography>

            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <Typography variant="body2">
                    {field.replaceAll("_", " ")}: {message}
                  </Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}

        {!hasErrors && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Required client details are complete and pass the input checks.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// MAIN APP
// ----------------------------------------------------

export default function App() {
  const [tab, setTab] = useState(0);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [plan, setPlan] = useState(null);
  const [planTitle, setPlanTitle] = useState("");
  const [file, setFile] = useState(null);
  const [scenario, setScenario] = useState("");
  const [planType, setPlanType] = useState("yearly");
  const [reviewAction, setReviewAction] = useState("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [versions, setVersions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedClientData = clients.find(
    (client) => String(client.client_id ?? client.id) === String(selectedClient)
  );
const clientValidationErrors = validateClientDetails(selectedClientData);
const isClientValid =selectedClientData &&Object.keys(clientValidationErrors).length === 0;
  const showMessage = (text) => {
    setError("");
    setMessage(text);
  };

  const showError = (text) => {
    setMessage("");
    setError(text);
  };

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const loadClients = async () => {
    try {
      const result = await getClients();
      const clientList = extractArray(result);
      setClients(clientList);

      setSelectedClient((current) => {
        if (current && clientList.some(
          (client) => String(client.client_id ?? client.id) === current
        )) return current;

        return clientList.length
          ? String(clientList[0].client_id ?? clientList[0].id)
          : "";
      });
    } catch (err) {
      showError(err.message);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    if (!file) return showError("Please select an Excel file first.");

    try {
      setUploading(true);
      clearMessages();
      const result = await uploadExcel(file);
      const warnings = (result.warnings || []).map((warning) =>
        `${warning.client_id ? `Client ${warning.client_id}: ` : ""}${warning.message}`
      );
      showMessage([
        result.message || "Excel uploaded successfully.",
        ...warnings
      ].join(" "));
      setFile(null);
      await loadClients();
    } catch (err) {
      showError(err.message);
    } finally {
      setUploading(false);
    }
  };

  
const runPlanAction = async (title, action) => {
  if (!selectedClient) {
    showError("Please select a client first.");
    return;
  }

  const errors = validateClientDetails(selectedClientData);

  if (Object.keys(errors).length > 0) {
    showError("Please correct the client details before generating a plan.");
    return;
  }

  try {
    setLoading(true);
    clearMessages();
    setPlan(null);

    const result = await action();

    setPlan(extractData(result));
    setPlanTitle(title);

    showMessage(result.message || `${title} completed successfully.`);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
};

  const loadPlanVersions = async () => {
    if (!selectedClient) return showError("Select a client first.");

    try {
      setLoading(true);
      clearMessages();

      const details = {};
      if (planType !== "yearly") details.month = selectedMonth;
      if (planType === "weekly") details.week = selectedWeek;

      const result = await getPlanVersions(planType, selectedClient, details);
      setVersions(result.data || []);
      showMessage("Version history loaded.");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIf = async () => {
    if (!selectedClient) return showError("Select a client first.");
    if (scenario.trim().length < 5) {
      return showError("Enter a scenario with at least five characters.");
    }
    const errors = validateClientDetails(selectedClientData);

if (Object.keys(errors).length > 0) {
  showError("Please correct the client details before regenerating a plan.");
  return;
}
    try {
      setLoading(true);
      clearMessages();
      setPlan(null);

      const details = { scenario: scenario.trim() };
      if (planType !== "yearly") details.month = selectedMonth;
      if (planType === "weekly") details.week = selectedWeek;

      const result = await regeneratePlan(planType, selectedClient, details);
      setPlan(extractData(result));
      setPlanTitle(`Revised ${planType} plan`);
      showMessage(result.message || "Revised plan generated successfully.");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedClient) return showError("Select a client first.");
    if (reviewAction === "changes_requested" && !reviewNotes.trim()) {
      return showError("Enter notes explaining the requested changes.");
    }

    try {
      setLoading(true);
      clearMessages();

      const details = {
        action: reviewAction,
        notes: reviewNotes,
        version: versions[0]?.version || 1
      };

      if (planType !== "yearly") details.month = selectedMonth;
      if (planType === "weekly") details.week = selectedWeek;

      const result = await submitCoachReview(selectedClient, planType, details);
      showMessage(result.message || "Coach review submitted.");
      setReviewNotes("");
      await loadReviews();
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!selectedClient) return;

    try {
      const result = await getCoachReviews({ clientId: selectedClient });
      setReviews(result.data || []);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDownload = async (format) => {
    if (!selectedClient) return showError("Select a client first.");

    try {
      setLoading(true);
      clearMessages();
      await downloadReport(selectedClient, format, {
        month: selectedMonth,
        week: selectedWeek
      });
      showMessage(`${format.toUpperCase()} report downloaded successfully.`);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSamplePreview = () => {
    const sample = {
      clientId: 1002,
      status: "pending_review",
      assessment: {
        overview: "A sample assessment focused on building consistent routines.",
        strengths: ["Willingness to engage in regular activities", "Enjoys outdoor activities"],
        opportunities: ["Build a regular schedule", "Explore different activities"],
        startingPoint: "Begin with manageable and flexible habits."
      },
      yearlyRoadmap: {
        yearTheme: "Building Stamina and Consistency",
        phases: [
          {
            phaseName: "Establishing a Routine",
            phaseOutcome: "Build a consistent and flexible routine.",
            months: [
              { month: 1, theme: "Routine Building", habits: ["Plan a regular routine", "Reflect on activities"], reflectionPrompt: "What felt manageable this month?" },
              { month: 2, theme: "Consistency Focus", habits: ["Review weekly schedule", "Try a preferred activity"], reflectionPrompt: "What helped me stay consistent?" },
              { month: 3, theme: "Adapt and Adjust", habits: ["Explore a new activity", "Reflect on progress"], reflectionPrompt: "What would I like to adjust?" }
            ]
          },
          {
            phaseName: "Skill Development",
            phaseOutcome: "Explore skills and activities at a comfortable pace.",
            months: [
              { month: 4, theme: "Technique Improvement", habits: ["Learn a new technique", "Practice safely"], reflectionPrompt: "What new skill did I explore?" },
              { month: 5, theme: "Explore and Expand", habits: ["Try a new route or activity", "Record reflections"], reflectionPrompt: "What did I enjoy exploring?" },
              { month: 6, theme: "Community Engagement", habits: ["Connect with a group", "Share experiences"], reflectionPrompt: "What did I learn from others?" }
            ]
          },
          {
            phaseName: "Time Management and Organization",
            phaseOutcome: "Improve planning and balance across commitments.",
            months: [
              { month: 7, theme: "Prioritize Activities", habits: ["Organize a weekly schedule", "Set reminders"], reflectionPrompt: "What helped me organize my time?" },
              { month: 8, theme: "Weekly Planning", habits: ["Plan the week", "Balance different commitments"], reflectionPrompt: "What worked well in my plan?" },
              { month: 9, theme: "Review and Refine", habits: ["Review routines", "Make flexible adjustments"], reflectionPrompt: "What would I change next?" }
            ]
          },
          {
            phaseName: "Personal Goals and Reflection",
            phaseOutcome: "Reflect on achievements and choose meaningful next steps.",
            months: [
              { month: 10, theme: "Setting Goals", habits: ["Choose a personal goal", "Write down next steps"], reflectionPrompt: "What matters most to me?" },
              { month: 11, theme: "Reflect and Reassess", habits: ["Review experiences", "Adjust plans"], reflectionPrompt: "What am I proud of?" },
              { month: 12, theme: "Year-End Reflection", habits: ["Summarize the year", "Plan future activities"], reflectionPrompt: "What did I learn this year?" }
            ]
          }
        ]
      },
      review: {
        reviewRequired: true,
        reviewReason: "Sample preview should be reviewed before use.",
        coachNotes: "Review the draft and adapt it to the client's preferences."
      },
      disclaimer: "Sample data for UI demonstration only."
    };

    setPlan(sample);
    setPlanTitle("Sample Yearly Roadmap");
    showMessage("Sample preview loaded. This is not AI-generated data.");
  };

  const handleMonthPlan = (month) => {
    setSelectedMonth(month);
    runPlanAction(`Monthly Plan - ${getMonthName(month)}`, () =>
      generateMonthlyPlan(selectedClient, month)
    );
  };

  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F6F8FB" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "#FFFFFF", color: "#203247", borderBottom: "1px solid #E6EBF1" }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main" }}><AutoAwesome /></Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>Transformation AI</Typography>
                <Typography variant="caption" color="text.secondary">
                  Personalized Journey Management
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              2027 Planning Dashboard
            </Typography>
          </Stack>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800}>Transformation Dashboard</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Manage client information, generate planning drafts, review plans, and download reports.
          </Typography>
        </Box>

        {(message || error) && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 3 }} onClose={clearMessages}>
            {error || message}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <MetricCard title="Total Clients" value={clients.length} icon={<Groups />} color="#315C81" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MetricCard title="Planning Year" value="2027" icon={<CalendarMonth />} color="#36A18B" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MetricCard title="AI Service" value="Connected" icon={<AutoAwesome />} color="#8B70B8" />
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ border: "1px solid #E6EBF1", borderRadius: 3, overflow: "hidden" }}>
          <Tabs
            value={tab}
            onChange={(event, value) => {
              setTab(value);
              setPlan(null);
              clearMessages();
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
            <Tab icon={<CloudUpload />} iconPosition="start" label="Upload Clients" />
            <Tab icon={<AutoAwesome />} iconPosition="start" label="Generate Plans" />
            <Tab icon={<History />} iconPosition="start" label="What-if & Versions" />
            <Tab icon={<RateReview />} iconPosition="start" label="Coach Review" />
            <Tab icon={<PictureAsPdf />} iconPosition="start" label="Reports" />
          </Tabs>

          <Divider />

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* DASHBOARD */}
            {tab === 0 && (
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={700}>Dashboard Overview</Typography>
                <Typography color="text.secondary">
                  Upload your Excel client file and select a client to generate planning drafts.
                </Typography>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Selected Client</Typography>
                    {selectedClientData ? (
                      <Stack spacing={1}>
                        <Typography>Name: {selectedClientData.name || "Not provided"}</Typography>
                        <Typography>Client ID: {selectedClientData.client_id ?? selectedClientData.id}</Typography>
                        <Typography>Primary Goal 1: {selectedClientData.primary_goal_1 || "Not provided"}</Typography>
                        <Typography>Primary Goal 2: {selectedClientData.primary_goal_2 || "Not provided"}</Typography>
                        <Typography>Secondary Goal 1: {selectedClientData.secondary_goal_1 || "Not provided"}</Typography>
                        <Typography>Secondary Goal 2: {selectedClientData.secondary_goal_2 || "Not provided"}</Typography>
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">
                        No client selected. Upload an Excel file to get started.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                <Button variant="outlined" onClick={loadClients} sx={{ alignSelf: "flex-start" }}>
                  Refresh Client List
                </Button>
              </Stack>
            )}

            {/* UPLOAD */}
            {tab === 1 && (
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={700}>Upload Client Excel</Typography>
                <Typography color="text.secondary">
                  Upload the current Excel template with all four goal columns. Legacy goal columns are preserved on import but require migration before plan generation.
                </Typography>

                <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderStyle: "dashed", bgcolor: "#FAFCFF", borderRadius: 3 }}>
                  <CloudUpload sx={{ fontSize: 48, color: "primary.main" }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>Choose an Excel file</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    Excel workbook (.xlsx), up to 5 MB
                  </Typography>
                  <Button variant="contained" component="label">
                    Browse File
                    <input hidden type="file" accept=".xlsx" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                  </Button>
                  {file && <Typography sx={{ mt: 2 }}>Selected: {file.name}</Typography>}
                </Paper>

                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  startIcon={uploading ? <CircularProgress size={18} /> : <CloudUpload />}
                >
                  {uploading ? "Uploading..." : "Upload Excel"}
                </Button>

                <Divider />
                <Typography variant="h6">Imported Clients ({clients.length})</Typography>

                {clients.length === 0 ? (
                  <Typography color="text.secondary">No clients loaded yet.</Typography>
                ) : clients.map((client) => (
                  <Paper key={client.client_id ?? client.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight={700}>{client.name || "Unnamed Client"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {client.client_id ?? client.id} · Primary goals: {client.primary_goal_1 || "Not specified"}; {client.primary_goal_2 || "Not specified"}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}

            {/* GENERATE PLANS */}
            {tab === 2 && (
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={700}>AI Plan Generation</Typography>

                <FormControl fullWidth>
                  <InputLabel>Select Client</InputLabel>
                  <Select value={selectedClient} label="Select Client" onChange={(event) => { setSelectedClient(event.target.value); setPlan(null); }}>
                    {clients.map((client) => {
                      const id = String(client.client_id ?? client.id);
                      return <MenuItem key={id} value={id}>{client.name || "Unnamed Client"} ({id})</MenuItem>;
                    })}
                  </Select>
                </FormControl>
                <ClientProfileCard
  client={selectedClientData}
  errors={clientValidationErrors}
/>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6">Yearly Roadmap</Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ my: 2 }}>
                          Generate a 12-month roadmap divided into four phases.
                        </Typography>
                        <Button fullWidth variant="contained" disabled={loading || !selectedClient} onClick={() => runPlanAction("Yearly Roadmap", () => generateRoadmap(selectedClient))}>
                          Generate Yearly Plan
                        </Button>
                        <Button fullWidth sx={{ mt: 1 }} disabled={loading || !selectedClient} onClick={() => runPlanAction("Saved Yearly Roadmap", () => getRoadmap(selectedClient))}>
                          View Saved Plan
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6">Monthly Plan</Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ my: 2 }}>
                          Generate a detailed plan for the selected month, aligned with its yearly roadmap objectives.
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Month</InputLabel>
                          <Select value={selectedMonth} label="Month" onChange={(event) => setSelectedMonth(event.target.value)}>
                            {monthOptions.map((month) => <MenuItem key={month} value={month}>{getMonthName(month)}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <Button fullWidth variant="contained" disabled={loading || !selectedClient} onClick={() => runPlanAction("Monthly Plan", () => generateMonthlyPlan(selectedClient, selectedMonth))}>
                          Generate Monthly Plan
                        </Button>
                        <Button fullWidth sx={{ mt: 1 }} disabled={loading || !selectedClient} onClick={() => runPlanAction("Saved Monthly Plan", () => getMonthlyPlan(selectedClient, selectedMonth))}>
                          View Saved Plan
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6">Weekly Plan</Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ my: 2 }}>
                          Generate a seven-day plan for the selected week; it continues the prior week when that plan is available.
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Week</InputLabel>
                          <Select value={selectedWeek} label="Week" onChange={(event) => setSelectedWeek(event.target.value)}>
                            {[1, 2, 3, 4].map((week) => <MenuItem key={week} value={week}>Week {week}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <Button fullWidth variant="contained" disabled={loading || !selectedClient} onClick={() => runPlanAction("Weekly Plan", () => generateWeeklyPlan(selectedClient, selectedMonth, selectedWeek))}>
                          Generate Weekly Plan
                        </Button>
                        <Button fullWidth sx={{ mt: 1 }} disabled={loading || !selectedClient} onClick={() => runPlanAction("Saved Weekly Plan", () => getWeeklyPlan(selectedClient, selectedMonth, selectedWeek))}>
                          View Saved Plan
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Button variant="outlined" onClick={loadSamplePreview}>
                  Load Sample Preview (Not AI Generated)
                </Button>

                {plan && (
                  <PlanViewer
                    title={planTitle}
                    value={plan}
                    onGenerateMonthly={handleMonthPlan}
                  />
                )}
              </Stack>
            )}

            {/* WHAT-IF */}
            {tab === 3 && (
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={700}>What-if Regeneration</Typography>
                <Typography color="text.secondary">
                  Describe a planning change. The AI can create a revised draft while preserving the previous version, if version history is enabled in your backend.
                </Typography>

                <FormControl fullWidth>
                  <InputLabel>Select Client</InputLabel>
                  <Select value={selectedClient} label="Select Client" onChange={(event) => setSelectedClient(event.target.value)}>
                    {clients.map((client) => {
                      const id = String(client.client_id ?? client.id);
                      return <MenuItem key={id} value={id}>{client.name} ({id})</MenuItem>;
                    })}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Plan Type</InputLabel>
                  <Select value={planType} label="Plan Type" onChange={(event) => { setPlanType(event.target.value); setVersions([]); }}>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>

                {planType !== "yearly" && (
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select value={selectedMonth} label="Month" onChange={(event) => setSelectedMonth(event.target.value)}>
                      {monthOptions.map((month) => <MenuItem key={month} value={month}>{getMonthName(month)}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}

                {planType === "weekly" && (
                  <FormControl fullWidth>
                    <InputLabel>Week</InputLabel>
                    <Select value={selectedWeek} label="Week" onChange={(event) => setSelectedWeek(event.target.value)}>
                      {[1, 2, 3, 4].map((week) => <MenuItem key={week} value={week}>Week {week}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}

                <TextField
                  label="What change should be applied?"
                  multiline
                  minRows={3}
                  value={scenario}
                  onChange={(event) => setScenario(event.target.value)}
                  placeholder="Example: Make the plan more flexible and simplify the monthly goals."
                  fullWidth
                />

                <Button variant="contained" disabled={loading || !selectedClient} onClick={handleWhatIf}>
                  Generate Revised Plan
                </Button>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>Version History</Typography>
                  <Button variant="outlined" startIcon={<History />} onClick={loadPlanVersions} disabled={loading || !selectedClient}>
                    Load Versions
                  </Button>
                </Stack>

                {versions.length === 0 ? (
                  <Typography color="text.secondary">No version history loaded.</Typography>
                ) : versions.map((item) => (
                  <Card variant="outlined" key={item.version}>
                    <CardContent>
                      <Typography fontWeight={700}>Version {item.version}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Date unavailable"}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>Change: {item.changeNote || "No change note"}</Typography>
                      <Button sx={{ mt: 1 }} onClick={() => { setPlan(item.plan); setPlanTitle(`Version ${item.version}`); }}>
                        View This Version
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {plan && <PlanViewer title={planTitle} value={plan} />}
              </Stack>
            )}

            {/* COACH REVIEW */}
            {tab === 4 && (
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={700}>Coach Review</Typography>
                <Typography color="text.secondary">
                  Record a coach decision for the selected plan version.
                </Typography>

                <FormControl fullWidth>
                  <InputLabel>Select Client</InputLabel>
                  <Select value={selectedClient} label="Select Client" onChange={(event) => setSelectedClient(event.target.value)}>
                    {clients.map((client) => {
                      const id = String(client.client_id ?? client.id);
                      return <MenuItem key={id} value={id}>{client.name} ({id})</MenuItem>;
                    })}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Plan Type</InputLabel>
                  <Select value={planType} label="Plan Type" onChange={(event) => setPlanType(event.target.value)}>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>

                {planType !== "yearly" && (
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select value={selectedMonth} label="Month" onChange={(event) => setSelectedMonth(event.target.value)}>
                      {monthOptions.map((month) => <MenuItem key={month} value={month}>{getMonthName(month)}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}

                {planType === "weekly" && (
                  <FormControl fullWidth>
                    <InputLabel>Week</InputLabel>
                    <Select value={selectedWeek} label="Week" onChange={(event) => setSelectedWeek(event.target.value)}>
                      {[1, 2, 3, 4].map((week) => <MenuItem key={week} value={week}>Week {week}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}

                <FormControl fullWidth>
                  <InputLabel>Review Decision</InputLabel>
                  <Select value={reviewAction} label="Review Decision" onChange={(event) => setReviewAction(event.target.value)}>
                    <MenuItem value="approved">Approve</MenuItem>
                    <MenuItem value="changes_requested">Request Changes</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Coach Notes"
                  multiline
                  minRows={3}
                  fullWidth
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Enter review comments or requested changes."
                />

                <Button variant="contained" disabled={loading || !selectedClient} onClick={handleReview}>
                  Submit Coach Review
                </Button>

                <Divider />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">Review History</Typography>
                  <Button onClick={loadReviews} disabled={!selectedClient}>Refresh</Button>
                </Stack>

                {reviews.length === 0 ? (
                  <Typography color="text.secondary">No review records loaded.</Typography>
                ) : reviews.map((review, index) => (
                  <Card variant="outlined" key={review.id ?? index}>
                    <CardContent>
                      <Typography fontWeight={700}>{review.planType} — {review.action}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {review.reviewedAt ? new Date(review.reviewedAt).toLocaleString() : "Date unavailable"}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>{review.notes || "No notes"}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {/* REPORTS */}
            {tab === 5 && (
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight={700}>Reports</Typography>
                <Typography color="text.secondary">
                  Download the selected client's available plans and coach review history.
                </Typography>

                <FormControl fullWidth>
                  <InputLabel>Select Client</InputLabel>
                  <Select value={selectedClient} label="Select Client" onChange={(event) => setSelectedClient(event.target.value)}>
                    {clients.map((client) => {
                      const id = String(client.client_id ?? client.id);
                      return <MenuItem key={id} value={id}>{client.name} ({id})</MenuItem>;
                    })}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select value={selectedMonth} label="Month" onChange={(event) => setSelectedMonth(event.target.value)}>
                    {monthOptions.map((month) => <MenuItem key={month} value={month}>{getMonthName(month)}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Week</InputLabel>
                  <Select value={selectedWeek} label="Week" onChange={(event) => setSelectedWeek(event.target.value)}>
                    {[1, 2, 3, 4].map((week) => <MenuItem key={week} value={week}>Week {week}</MenuItem>)}
                  </Select>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                      <CardContent>
                        <PictureAsPdf color="error" sx={{ fontSize: 36 }} />
                        <Typography variant="h6">PDF Report</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Download a printable summary of the client's plans and reviews.
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2 }} disabled={loading || !selectedClient} onClick={() => handleDownload("pdf")}>
                          Download PDF
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                      <CardContent>
                        <TableChart color="success" sx={{ fontSize: 36 }} />
                        <Typography variant="h6">Excel Report</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Download roadmap, monthly, weekly, and review data as a spreadsheet.
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2 }} disabled={loading || !selectedClient} onClick={() => handleDownload("excel")}>
                          Download Excel
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Box>
        </Paper>

        {loading && (
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Processing your request...</Typography>
          </Stack>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 3 }}>
          Transformation AI POC · 2027 Planning
        </Typography>
      </Container>
    </Box>
  );
}
