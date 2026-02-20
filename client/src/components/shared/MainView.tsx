import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProspectList from '../prospects/ProspectList';
import RiderList from '../riders/RiderList';
import WorkerList from '../workers/WorkerList';
import BusLogView from '../buslog/BusLog';
import SaturdayVisitLog from '../satvisit/SaturdayVisitLog';
import LeaderboardView from '../leaderboard/LeaderboardView';
import PrayerRequests from '../prayer/PrayerRequests';
import BirthdayBanner from './BirthdayBanner';

const MainView: React.FC = () => {
  const { section } = useApp();

  const renderSection = () => {
    switch (section) {
      case 'prospects':
        return <ProspectList />;
      case 'riders':
        return <RiderList />;
      case 'workers':
        return <WorkerList />;
      case 'satvisit':
        return <SaturdayVisitLog />;
      case 'buslog':
        return <BusLogView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'prayer':
        return <PrayerRequests />;
      default:
        return <ProspectList />;
    }
  };

  return (
    <>
      <BirthdayBanner />
      {renderSection()}
    </>
  );
};

export default MainView;

