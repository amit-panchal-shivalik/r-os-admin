import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { OtpPage } from '../pages/auth/OtpPage';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import EhsDashboardPage from '@/pages/ehs/EhsDashboardPage';
import SafetyInductionPage from '@/pages/ehs/SafetyInductionPage';
import SafetyInductionPrintPage from '@/pages/ehs/SafetyInductionPrintPage';
import InductionTrackingPage from '@/pages/ehs/InductionTrackingPage';
import ToolBoxTalkPage from '@/pages/ehs/ToolBoxTalkPage';
import FirstAidTreatmentRegisterPage from '@/pages/ehs/FirstAidTreatmentRegisterPage';
import EquipmentTestingMonitoringPage from '@/pages/ehs/EquipmentTestingMonitoringPage';
import ExcavatorChecklistPage from '@/pages/ehs/ExcavatorChecklistPage';
import JcbChecklistPage from '@/pages/ehs/JcbChecklistPage';
import WeldingMachineChecklistPage from '@/pages/ehs/WeldingMachineChecklistPage';
import ReinforcementCuttingChecklistPage from '@/pages/ehs/ReinforcementCuttingChecklistPage';
import ReinforcementBendingChecklistPage from '@/pages/ehs/ReinforcementBendingChecklistPage';
import ObservationSheetPage from '@/pages/ehs/ObservationSheetPage';
import PpeRegisterPage from '@/pages/ehs/PpeRegisterPage';
import TruckChecklistPage from '@/pages/ehs/TruckChecklistPage';
import SafetyStatisticsBoardPage from '@/pages/ehs/SafetyStatisticsBoardPage';
import AccidentInvestigationReportPage from '@/pages/ehs/AccidentInvestigationReportPage';
import PortableElectricalToolsPage from '@/pages/ehs/PortableElectricalToolsPage';
import SafetyViolationDebitNotePage from '@/pages/ehs/SafetyViolationDebitNotePage';
import FireExtinguisherMonitoringPage from '@/pages/ehs/FireExtinguisherMonitoringPage';
import FirstAidChecklistPage from '@/pages/ehs/FirstAidChecklistPage';
import MockDrillSchedulePage from '@/pages/ehs/MockDrillSchedulePage';
import MockDrillReportPage from '@/pages/ehs/MockDrillReportPage';
import LadderInspectionChecklistPage from '@/pages/ehs/LadderInspectionChecklistPage';
import HeightSafetyPage from '@/pages/ehs/HeightSafetyPage';
import WorkPermitPage from '@/pages/ehs/WorkPermitPage';
import EhsCoreTeamStructurePage from '@/pages/ehs/EhsCoreTeamStructurePage';
import EhsCommitteeMomPage from '@/pages/ehs/EhsCommitteeMomPage';
import NearMissReportPage from '@/pages/ehs/NearMissReportPage';
import ScaffoldInspectionChecklistPage from '@/pages/ehs/ScaffoldInspectionChecklistPage';
import FullBodyHarnessInspectionPage from '@/pages/ehs/FullBodyHarnessInspectionPage';
import SuggestionsReviewSheetPage from '@/pages/ehs/SuggestionsReviewSheetPage';
import ContractorDirectoryPage from '@/pages/ehs/ContractorDirectoryPage';
import SiteDirectoryPage from '@/pages/ehs/SiteDirectoryPage';

/* current user roles */
const getUserRoles = (): string[] => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') ?? '{}');
    return Array.isArray(info.userRoles) ? info.userRoles : ['Guest'];
  } catch {
    return ['Guest'];
  }
};

/* Role default route mapping */
const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/ehs/dashboard',
  EHSManager: '/ehs/dashboard',
  EHSExecutive: '/ehs/dashboard',
  EHSSupervisor: '/ehs/dashboard',
};

/* Component that decides where to redirect  */
const RedirectByRole = () => {
  const location = useLocation();
  const roles = getUserRoles();

  // If we are already on a page that belongs to the user – stay there
  if (location.pathname !== '/' && location.pathname !== '') {
    return null; // let the child route render
  }

  // Find the first matching default route
  for (const role of roles) {
    if (ROLE_DEFAULTS[role]) {
      return <Navigate to={ROLE_DEFAULTS[role]} replace />;
    }
  }

  // Fallback for unknown / Guest
  return <Navigate to="/ehs/dashboard" replace />;
};

/* ────── Main router ────── */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/otp"
        element={
          <PublicRoute>
            <OtpPage />
          </PublicRoute>
        }
      />

      {/* Private Route */}
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Default entry point – decides where to go based on current role */}
        <Route index element={<RedirectByRole />} />

        {/* All private pages  */}
        <Route path="ehs/dashboard" element={<EhsDashboardPage />} />
        <Route path="ehs/sites" element={<SiteDirectoryPage />} />
        <Route path="ehs/contractors" element={<ContractorDirectoryPage />} />
        <Route path="ehs/safety-induction" element={<SafetyInductionPage />} />
        <Route path="ehs/safety-induction/print/:id" element={<SafetyInductionPrintPage />} />
        <Route path="ehs/induction-tracking" element={<InductionTrackingPage />} />
        <Route path="ehs/tool-box-talk" element={<ToolBoxTalkPage />} />
        <Route path="ehs/first-aid" element={<FirstAidTreatmentRegisterPage />} />
        <Route path="ehs/equipment-testing" element={<EquipmentTestingMonitoringPage />} />
        <Route path="ehs/excavator-checklist" element={<ExcavatorChecklistPage />} />
        <Route path="ehs/jcb-checklist" element={<JcbChecklistPage />} />
        <Route path="ehs/welding-machine-checklist" element={<WeldingMachineChecklistPage />} />
        <Route path="ehs/reinforcement-cutting-checklist" element={<ReinforcementCuttingChecklistPage />} />
        <Route path="ehs/reinforcement-bending-checklist" element={<ReinforcementBendingChecklistPage />} />
        <Route path="ehs/observation-sheet" element={<ObservationSheetPage />} />
        <Route path="ehs/ppe-register" element={<PpeRegisterPage />} />
        <Route path="ehs/truck-checklist" element={<TruckChecklistPage />} />
        <Route path="ehs/safety-statistics" element={<SafetyStatisticsBoardPage />} />
        <Route path="ehs/accident-investigation" element={<AccidentInvestigationReportPage />} />
        <Route path="ehs/portable-tools" element={<PortableElectricalToolsPage />} />
        <Route path="ehs/safety-violation" element={<SafetyViolationDebitNotePage />} />
        <Route path="ehs/fire-extinguisher" element={<FireExtinguisherMonitoringPage />} />
        <Route path="ehs/first-aid-checklist" element={<FirstAidChecklistPage />} />
        <Route path="ehs/mock-drill-schedule" element={<MockDrillSchedulePage />} />
        <Route path="ehs/mock-drill-report" element={<MockDrillReportPage />} />
        <Route path="ehs/ladder-inspection" element={<LadderInspectionChecklistPage />} />
        <Route path="ehs/height-safety" element={<HeightSafetyPage />} />
        <Route path="ehs/work-permit" element={<WorkPermitPage />} />
        <Route path="ehs/core-team" element={<EhsCoreTeamStructurePage />} />
        <Route path="ehs/committee-mom" element={<EhsCommitteeMomPage />} />
        <Route path="ehs/near-miss" element={<NearMissReportPage />} />
        <Route path="ehs/scaffold-inspection" element={<ScaffoldInspectionChecklistPage />} />
        <Route path="ehs/full-body-harness" element={<FullBodyHarnessInspectionPage />} />
        <Route path="ehs/suggestions-review" element={<SuggestionsReviewSheetPage />} />

        {/* Catch-all inside private area (keeps the layout) */}
        <Route path="*" element={<RedirectByRole />} />
      </Route>

      {/* Global catch-all (outside private area) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};