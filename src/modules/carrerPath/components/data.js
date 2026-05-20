export const careerPathData = {
	title: 'Career Path',
	subtitle: 'Your learning journey and role progression',
	legend: [
		{ label: 'Completed', colorClass: 'bg-emerald-500' },
		{ label: 'Current', colorClass: 'bg-sky-500' },
		{ label: 'Upcoming', colorClass: 'bg-slate-300' },
	],
};

export const employeeCareerPathData = {
	...careerPathData,
	stages: [
		{
			id: 'employee-1',
			title: 'GTE',
			subtitle: 'Jan 2019',
			status: 'completed',
			completedCourses: [
				{ id: 'c1-1', name: 'Fundamentals of Computer Science', type: 'Course', completedOn: '10 Jan 2019' },
				{ id: 'c1-2', name: 'SQL for Beginners', type: 'Course', completedOn: '15 Feb 2019' },
				{ id: 'c1-3', name: 'Python Programming Basics', type: 'Course', completedOn: '20 Mar 2019' },
				{ id: 'c1-4', name: 'Introduction to Data Analysis', type: 'Assessment', completedOn: '01 Apr 2019' },
			],
			nextRoleRequirements: [
				{ id: 'r1-1', name: 'SQL for Beginners', type: 'Course', status: 'Completed' },
				{ id: 'r1-2', name: 'Python Programming Basics', type: 'Course', status: 'Completed' },
				{ id: 'r1-3', name: 'Introduction to Data Analysis', type: 'Assessment', status: 'Completed' },
				{ id: 'r1-4', name: 'Data Engineering Fundamentals', type: 'Course', status: 'Completed' },
			],
		},
		{
			id: 'employee-2',
			title: 'Data Engineer',
			subtitle: 'Jan 2019 - Jan 2021',
			status: 'current',
			completedCourses: [
				{ id: 'c2-1', name: 'Apache Spark Fundamentals', type: 'Course', completedOn: '15 Mar 2020' },
				{ id: 'c2-2', name: 'AWS Certified Data Analytics', type: 'Certificate', completedOn: '20 Jun 2020' },
				{ id: 'c2-3', name: 'Data Pipeline Design', type: 'Course', completedOn: '10 Sep 2020' },
				{ id: 'c2-4', name: 'ETL Best Practices', type: 'Assessment', completedOn: '05 Dec 2020' },
				{ id: 'c2-5', name: 'Advanced SQL Optimization', type: 'Course', completedOn: '15 Jan 2021' },
			],
			nextRoleRequirements: [
				{ id: 'r2-1', name: 'Apache Spark Advanced', type: 'Course', status: 'Completed' },
				{ id: 'r2-2', name: 'Distributed Systems Design', type: 'Course', status: 'Pending' },
				{ id: 'r2-3', name: 'AWS Data Engineer Certification', type: 'Certificate', status: 'Completed' },
				{ id: 'r2-4', name: 'Data Architecture Principles', type: 'Course', status: 'Pending' },
				{ id: 'r2-5', name: 'Performance Tuning Workshop', type: 'Assessment', status: 'Pending' },
			],
		},
		{
			id: 'employee-3',
			title: 'Senior Data Engineer',
			subtitle: 'Jan 2021 - Jan 2024',
			status: 'upcoming',
			completedCourses: [],
			nextRoleRequirements: [
				{ id: 'r3-1', name: 'Enterprise Data Architecture', type: 'Course', status: 'Pending' },
				{ id: 'r3-2', name: 'Team Leadership Fundamentals', type: 'Course', status: 'Pending' },
				{ id: 'r3-3', name: 'Data Governance Framework', type: 'Certificate', status: 'Pending' },
				{ id: 'r3-4', name: 'Advanced Cloud Architecture', type: 'Course', status: 'Pending' },
				{ id: 'r3-5', name: 'Technical Mentorship Program', type: 'Assessment', status: 'Pending' },
			],
		},
		{
			id: 'employee-4',
			title: 'Lead Data Engineer / Associate Data Architect',
			subtitle: 'Jan 2024 - Present',
			status: 'upcoming',
			completedCourses: [],
			nextRoleRequirements: [
				{ id: 'r4-1', name: 'Data Architecture Design Patterns', type: 'Course', status: 'Pending' },
				{ id: 'r4-2', name: 'GCP Professional Data Engineer', type: 'Certificate', status: 'Pending' },
				{ id: 'r4-3', name: 'Stakeholder Management', type: 'Course', status: 'Pending' },
				{ id: 'r4-4', name: 'Architecture Review Board Assessment', type: 'Assessment', status: 'Pending' },
			],
		},
		{
			id: 'employee-5',
			title: 'Data Architect',
			subtitle: 'Upcoming...',
			status: 'upcoming',
			completedCourses: [],
			nextRoleRequirements: [
				{ id: 'r5-1', name: 'Enterprise Architecture Frameworks', type: 'Course', status: 'Pending' },
				{ id: 'r5-2', name: 'TOGAF Certification', type: 'Certificate', status: 'Pending' },
				{ id: 'r5-3', name: 'Strategic Data Leadership', type: 'Course', status: 'Pending' },
				{ id: 'r5-4', name: 'Cross-Functional Leadership', type: 'Assessment', status: 'Pending' },
			],
		},
		{
			id: 'employee-6',
			title: 'Senior Data Architect',
			subtitle: 'Upcoming...',
			status: 'upcoming',
			completedCourses: [],
			nextRoleRequirements: [
				{ id: 'r6-1', name: 'Organisational Data Strategy', type: 'Course', status: 'Pending' },
				{ id: 'r6-2', name: 'AI & ML Architecture Design', type: 'Course', status: 'Pending' },
				{ id: 'r6-3', name: 'Data Mesh Architecture', type: 'Certificate', status: 'Pending' },
				{ id: 'r6-4', name: 'Executive Presentation Skills', type: 'Assessment', status: 'Pending' },
			],
		},
		{
			id: 'employee-7',
			title: 'Principle Data Architect',
			subtitle: 'Upcoming...',
			status: 'upcoming',
			completedCourses: [],
			nextRoleRequirements: [],
		},
	],
};

export const managerCareerPathData = {
	...careerPathData,
	stages: [
		{
			id: 'manager-1',
			title: 'Project Lead I',
			subtitle: 'Jan 2019 - Dec 2020',
			status: 'completed',
			description: 'Led project execution, delivery planning, and stakeholder communication.',
		},
		{
			id: 'manager-2',
			title: 'Project Lead II',
			subtitle: 'Jan 2021 - Present',
			status: 'current',
			description: 'Owns cross-functional delivery and mentoring for the current portfolio.',
		},
		{
			id: 'manager-3',
			title: 'Program Lead',
			subtitle: 'Upcoming...',
			status: 'upcoming',
			description: 'Planned progression into broader program and portfolio leadership.',
		},
	],
};
