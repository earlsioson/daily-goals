// src/components/DynamicTimeline.tsx
import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import { TimelineItem as TimelineItemType } from '@/types/timeline';

// Import various icons
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import HotelIcon from '@mui/icons-material/Hotel';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import CommuteIcon from '@mui/icons-material/Commute';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PaletteIcon from '@mui/icons-material/Palette';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Map icons to categories
const iconMap = {
  work: <LaptopMacIcon />,
  food: <FastfoodIcon />,
  rest: <HotelIcon />,
  exercise: <FitnessCenterIcon />,
  meeting: <GroupsIcon />,
  learning: <SchoolIcon />,
  social: <PeopleIcon />,
  travel: <CommuteIcon />,
  shopping: <ShoppingCartIcon />,
  housekeeping: <CleaningServicesIcon />,
  entertainment: <TheaterComedyIcon />,
  health: <HealthAndSafetyIcon />,
  creative: <PaletteIcon />,
  personal: <SelfImprovementIcon />,
  other: <HelpOutlineIcon />
};

interface DynamicTimelineProps {
  items: TimelineItemType[];
}

export default function DynamicTimeline({ items }: DynamicTimelineProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Timeline position="alternate">
      {items.map((item, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent
            sx={{ m: 'auto 0' }}
            align="right"
            variant="body2"
            color="text.secondary"
          >
            {item.when}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color={index % 2 === 0 ? "primary" : "secondary"}>
              {iconMap[item.icon as keyof typeof iconMap]}
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              {item.what}
            </Typography>
            <Typography>{item.why}</Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
