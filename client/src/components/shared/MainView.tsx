import React from 'react';
import { useApp } from '../../contexts/AppContext';
import ProspectList from '../prospects/ProspectList';
import RiderList from '../riders/RiderList';
import WorkerList from '../workers/WorkerList';
import BusLogView from '../buslog/BusLog';
import SaturdayVisitLog from '../satvisit/SaturdayVisitLog';

const MainView: React.FC = () => {
  const { section } = useApp();

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
    default:
      return <ProspectList />;
  }
};

export default MainView;
