import { useState } from 'react';
import { Award, BookOpen, CheckCircle, Lock, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

const EMPLOYEE_DATA = {
  currentRole: 'Senior Developer',
  band: 'SE2',
  stages: [
    {
      id: 1,
      role: 'Junior Developer',
      band: 'GTE',
      period: 'Mar 2021 – Dec 2021',
      status: 'completed',
      milestones: [
        { id: 'm1', type: 'course',      title: 'TypeScript Fundamentals',          date: 'Apr 2021', status: 'completed', detail: 'Assigned by Manager · Score 92%'      },
        { id: 'm2', type: 'course',      title: 'React Basics',                     date: 'Jun 2021', status: 'completed', detail: 'Assigned by Admin · Score 88%'        },
        { id: 'm3', type: 'certificate', title: 'React Professional Certification', date: 'Aug 2021', status: 'completed', detail: 'Issued by Meta · ID: META-REACT-2021' },
        { id: 'm4', type: 'course',      title: 'Node.js Backend Development',      date: 'Oct 2021', status: 'completed', detail: 'Assigned by Manager · Score 95%'      },
      ],
    },
    {
      id: 2,
      role: 'Developer',
      band: 'SE1',
      period: 'Jan 2022 – Nov 2022',
      status: 'completed',
      milestones: [
        { id: 'm5', type: 'course',      title: 'System Design Essentials', date: 'Feb 2022', status: 'completed', detail: 'Assigned by Admin · Score 90%'        },
        { id: 'm6', type: 'certificate', title: 'AWS Certified Developer',  date: 'May 2022', status: 'completed', detail: 'Issued by Amazon · ID: AWS-DEV-2022'  },
        { id: 'm7', type: 'course',      title: 'GraphQL API Development',  date: 'Aug 2022', status: 'completed', detail: 'Assigned by Manager · Score 87%'      },
        { id: 'm8', type: 'course',      title: 'Docker & Kubernetes',      date: 'Oct 2022', status: 'completed', detail: 'Assigned by Admin · Score 91%'        },
      ],
    },
    {
      id: 3,
      role: 'Senior Developer',
      band: 'SE2',
      period: 'Dec 2022 – Present',
      status: 'active',
      milestones: [
        { id: 'm9',  type: 'course',      title: 'Advanced React Patterns',          date: 'Jan 2023', status: 'completed', detail: 'Assigned by Manager · Score 94%'          },
        { id: 'm10', type: 'certificate', title: 'AWS Certified Solutions Architect', date: 'Apr 2023', status: 'completed', detail: 'Issued by Amazon · ID: AWS-CSA-2023'       },
        { id: 'm11', type: 'course',      title: 'Cloud Computing with AWS',          date: 'Jul 2023', status: 'ongoing',   detail: '60% completed · Assigned by Admin'         },
      ],
    },
  ],
};

const MANAGER_DATA = {
  currentRole: 'Project Lead II',
  band: 'PL2',
  stages: [
    {
      id: 1,
      role: 'Project Lead I',
      band: 'PL1',
      period: 'Jan 2019 – Dec 2020',
      status: 'completed',
      milestones: [
        { id: 'p1', type: 'course',      title: 'Agile & Scrum Fundamentals',        date: 'Mar 2019', status: 'completed', detail: 'Assigned by Admin · Score 91%'           },
        { id: 'p2', type: 'course',      title: 'Team Communication Skills',         date: 'Jun 2019', status: 'completed', detail: 'Assigned by Admin · Score 88%'           },
        { id: 'p3', type: 'certificate', title: 'Professional Scrum Master I',       date: 'Sep 2019', status: 'completed', detail: 'Issued by Scrum.org · ID: PSM-2019'      },
        { id: 'p4', type: 'course',      title: 'Project Planning & Estimation',     date: 'Feb 2020', status: 'completed', detail: 'Assigned by Admin · Score 93%'           },
        { id: 'p5', type: 'certificate', title: 'AWS Certified Solutions Architect', date: 'Sep 2020', status: 'completed', detail: 'Issued by Amazon · ID: AWS-CSA-2020'     },
      ],
    },
    {
      id: 2,
      role: 'Project Lead II',
      band: 'PL2',
      period: 'Jan 2021 – Present',
      status: 'active',
      milestones: [
        { id: 'p6', type: 'course',      title: 'Executive Leadership Program', date: 'Mar 2021', status: 'completed', detail: 'Assigned by Admin · Score 95%'       },
        { id: 'p7', type: 'certificate', title: 'PMP — Project Management',     date: 'Jul 2021', status: 'completed', detail: 'Issued by PMI · ID: PMI-PMP-2021'    },
        { id: 'p8', type: 'course',      title: 'Advanced Risk Management',     date: 'Jan 2022', status: 'completed', detail: 'Assigned by Admin · Score 89%'       },
        { id: 'p9', type: 'course',      title: 'Stakeholder Management',       date: 'Aug 2023', status: 'ongoing',   detail: '45% completed · Assigned by Admin'   },
      ],
    },
  ],
};

function getStageProgress(stage) {
  if (stage.status === 'completed') return 100;
  if (stage.milestones.length === 0) return 0;
  const done = stage.milestones.filter((m) => m.status === 'completed').length;
  return Math.round((done / stage.milestones.length) * 100);
}

function MilestoneIcon({ type, status }) {
  const base = 'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2';
  if (status === 'completed')
    return <div className={`${base} bg-green-500 border-green-500`}><CheckCircle className="w-3.5 h-3.5 text-white" /></div>;
  if (status === 'ongoing')
    return <div className={`${base} bg-blue-500 border-blue-500`}>{type === 'certificate' ? <Award className="w-3 h-3 text-white" /> : <BookOpen className="w-3 h-3 text-white" />}</div>;
  return <div className={`${base} bg-white border-gray-300`}><Lock className="w-2.5 h-2.5 text-gray-400" /></div>;
}

function StageNode({ stage, isLast, expanded, onToggle }) {
  const lineColor = stage.status === 'completed' ? 'bg-green-400' : 'bg-gradient-to-b from-green-400 to-blue-300';
  const nodeBg    = stage.status === 'completed' ? 'bg-green-500 border-green-500' : 'bg-blue-600 border-blue-600';

  return (
    <div className="flex gap-0">
      <div className="flex flex-col items-center w-12 flex-shrink-0">
        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shadow z-10 flex-shrink-0 ${nodeBg}`}>
          {stage.status === 'completed'
            ? <CheckCircle className="w-4 h-4 text-white" />
            : <TrendingUp  className="w-4 h-4 text-white" />}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[56px] mt-1 ${lineColor}`} />}
      </div>

      <div className="flex-1 mb-5 ml-2">
        <div
          className={`rounded-xl border shadow-sm p-4 cursor-pointer transition-all ${
            stage.status === 'active' ? 'border-blue-200 bg-blue-50/40' : 'border-green-100 bg-green-50/20'
          }`}
          onClick={onToggle}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  stage.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {stage.status === 'active' ? 'Current' : 'Completed'}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{stage.band}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800">{stage.role}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{stage.period}</p>
            </div>
            {stage.milestones.length > 0 && (
              <button className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>

          {stage.milestones.length > 0 && (
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${stage.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${getStageProgress(stage)}%` }}
              />
            </div>
          )}
        </div>

        {expanded && stage.milestones.length > 0 && (
          <div className="mt-2.5 ml-3 space-y-2">
            {stage.milestones.map((m, mi) => (
              <div key={m.id} className="flex gap-2.5 items-start">
                <div className="flex flex-col items-center w-6 flex-shrink-0 pt-0.5">
                  <MilestoneIcon type={m.type} status={m.status} />
                  {mi < stage.milestones.length - 1 && (
                    <div className={`w-px flex-1 min-h-[18px] mt-1 ${m.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div className={`flex-1 rounded-lg border px-3 py-2 mb-0.5 ${
                  m.status === 'completed' ? 'bg-white border-gray-100'   :
                  m.status === 'ongoing'   ? 'bg-blue-50 border-blue-100' :
                  'bg-gray-50 border-gray-100 opacity-60'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          m.type === 'certificate'
                            ? m.status === 'completed' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
                            : m.status === 'completed' ? 'bg-green-100 text-green-700'
                            : m.status === 'ongoing'   ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {m.type === 'certificate' ? 'Certificate' : 'Course'}
                        </span>
                        {m.status === 'ongoing' && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">In Progress</span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold ${m.status === 'not-started' ? 'text-gray-400' : 'text-gray-800'}`}>{m.title}</p>
                      {/* <p className="text-[10px] text-gray-400 mt-0.5">{m.detail}</p> */}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5 whitespace-nowrap">{m.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CareerPath({ role = 'employee' }) {
  const data = role === 'manager' ? MANAGER_DATA : EMPLOYEE_DATA;
  const { currentRole, band, stages } = data;

  const visibleStages = stages.filter((s) => s.status !== 'upcoming');
//   const activeStage   = stages.find((s) => s.status === 'active');
  const nextStage     = stages.find((s) => s.status === 'upcoming');
//   const stageProgress = activeStage ? getStageProgress(activeStage) : 0;

  const [expanded, setExpanded] = useState(
    Object.fromEntries(stages.map((s) => [s.id, s.status === 'active']))
  );

  function toggleStage(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Career Path</h1>
        <p className="text-sm text-gray-500 mt-1">Your learning journey and role progression</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1">Current Role</p>
            <h2 className="text-2xl font-bold">
              {currentRole}
              <span className="ml-2 text-sm font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">{band}</span>
            </h2>
            {nextStage && (
              <p className="text-sm text-blue-100 mt-2">
                Next: <span className="font-semibold text-white">{nextStage.role}</span>
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            {/* <p className="text-4xl font-extrabold leading-none">{stageProgress}%</p>
            <p className="text-blue-200 text-xs mt-1">current stage</p> */}
            {/* <div className="mt-3 w-32 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${stageProgress}%` }} />
            </div> */}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">Progression Timeline</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setExpanded(Object.fromEntries(stages.map((s) => [s.id, true])))}  className="text-xs text-blue-600 hover:underline font-medium">Expand all</button>
            <button onClick={() => setExpanded(Object.fromEntries(stages.map((s) => [s.id, false])))} className="text-xs text-gray-400 hover:underline font-medium">Collapse all</button>
          </div>
        </div>

        {visibleStages.map((stage, idx) => (
          <StageNode
            key={stage.id}
            stage={stage}
            isLast={idx === visibleStages.length - 1}
            expanded={!!expanded[stage.id]}
            onToggle={() => toggleStage(stage.id)}
          />
        ))}

        <div className="mt-2 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
          {[
            { color: 'bg-green-500', label: 'Completed'   },
            { color: 'bg-blue-500',  label: 'In Progress' },
            { color: 'bg-amber-400', label: 'Certificate' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}