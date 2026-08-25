const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Application = require('./models/Application');
const Timeline = require('./models/Timeline');
const Interview = require('./models/Interview');

dotenv.config();

const importData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_application_tracker';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB for seeding sample data...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Application.deleteMany(),
      Timeline.deleteMany(),
      Interview.deleteMany(),
    ]);
    console.log('🧹 Purged existing database collections.');

    // 1. Create Admin
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Platform Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@jobtracker.com').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isBlocked: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      headline: 'System Administrator & DevOps Lead',
      skills: ['Cloud Architecture', 'Express', 'MongoDB', 'Docker', 'AWS'],
    });

    // 2. Create Demo Users
    const user1 = await User.create({
      name: 'Pritiranjan Biswal',
      email: 'demo@jobtracker.com',
      password: 'Demo@123456',
      role: 'user',
      isBlocked: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      headline: 'B.Tech Fresher | Aspiring Full Stack & MERN Developer',
      bio: 'Final-year Computer Science student passionate about building scalable web applications with React, Node.js, and MongoDB. Solved 400+ DSA problems on LeetCode.',
      skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'Tailwind CSS', 'Git', 'C++', 'Data Structures'],
      preferredRole: 'Software Development Engineer (SDE-1)',
      preferredLocation: 'Bangalore / Hyderabad / Remote',
      githubUrl: 'https://github.com/Pritiranjan-Biswal',
      linkedinUrl: 'https://linkedin.com/in/pritiranjan-biswal',
      portfolioUrl: 'https://pritiranjan.dev',
      resume: {
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        publicId: 'demo_resume_1',
        fileName: 'Pritiranjan_Biswal_Resume_2026.pdf',
        uploadedAt: new Date(),
      },
    });

    const user2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@jobtracker.com',
      password: 'Sarah@123456',
      role: 'user',
      isBlocked: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      headline: 'Frontend Engineer | UI/UX Enthusiast',
      bio: 'Passionate about crafting intuitive, accessible user experiences.',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
      preferredRole: 'Frontend Developer',
      preferredLocation: 'Remote',
    });

    const userBlocked = await User.create({
      name: 'Spam User',
      email: 'blocked@jobtracker.com',
      password: 'Spam@123456',
      role: 'user',
      isBlocked: true,
      headline: 'Suspended Account',
    });

    console.log('👥 Created Admin and Demo Users.');

    // 3. Create Sample Applications for User 1 (Pritiranjan)
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const daysFuture = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const applicationsData = [
      {
        companyName: 'Google',
        jobTitle: 'Software Engineer (L3) - Early Career',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹32 LPA',
        jobUrl: 'https://careers.google.com',
        appliedDate: daysAgo(28),
        status: 'Interview',
        source: 'Referral',
        notes: 'Referred by college senior. Covered DSA & Graphs revision.',
        followUpDate: daysFuture(3),
        priority: 'High',
      },
      {
        companyName: 'Microsoft',
        jobTitle: 'Software Development Engineer - 1',
        jobType: 'Full Time',
        location: 'Hyderabad, India',
        salary: '₹28 LPA',
        jobUrl: 'https://careers.microsoft.com',
        appliedDate: daysAgo(35),
        status: 'Selected',
        source: 'Campus Placement',
        notes: 'Received official offer letter! Team match with Azure Cloud group.',
        priority: 'High',
      },
      {
        companyName: 'Amazon',
        jobTitle: 'SDE Intern / FTE 2026',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹26 LPA',
        jobUrl: 'https://amazon.jobs',
        appliedDate: daysAgo(20),
        status: 'OA Cleared',
        source: 'LinkedIn',
        notes: 'Cleared HackerRank assessment with 2/2 test cases passed. Awaiting recruiter interview scheduling.',
        followUpDate: daysFuture(2),
        priority: 'High',
      },
      {
        companyName: 'Atlassian',
        jobTitle: 'Graduate Software Engineer',
        jobType: 'Full Time',
        location: 'Bengaluru / Remote',
        salary: '₹30 LPA',
        jobUrl: 'https://atlassian.com/careers',
        appliedDate: daysAgo(15),
        status: 'Online Assessment',
        source: 'Company Portal',
        notes: 'Assessment link received via Codility. Deadline in 3 days.',
        followUpDate: daysFuture(2),
        priority: 'High',
      },
      {
        companyName: 'Uber',
        jobTitle: 'Backend Software Engineer',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹35 LPA',
        jobUrl: 'https://uber.com/careers',
        appliedDate: daysAgo(10),
        status: 'Applied',
        source: 'Referral',
        notes: 'Applied with customized resume emphasizing Node.js microservices.',
        followUpDate: daysFuture(7),
        priority: 'Medium',
      },
      {
        companyName: 'Razorpay',
        jobTitle: 'Software Engineer - Frontend',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹18 LPA',
        jobUrl: 'https://razorpay.com/jobs',
        appliedDate: daysAgo(22),
        status: 'Interview',
        source: 'LinkedIn',
        notes: 'Technical round 1 completed (React + Performance). System design round next.',
        followUpDate: daysFuture(4),
        priority: 'High',
      },
      {
        companyName: 'CRED',
        jobTitle: 'Frontend Engineer - Product',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹22 LPA',
        jobUrl: 'https://cred.club/careers',
        appliedDate: daysAgo(40),
        status: 'Rejected',
        source: 'LinkedIn',
        notes: 'Position closed internally. Received encouraging recruiter feedback.',
        priority: 'Low',
      },
      {
        companyName: 'Zomato',
        jobTitle: 'Full Stack Engineer',
        jobType: 'Full Time',
        location: 'Gurgaon / Remote',
        salary: '₹16 LPA',
        jobUrl: 'https://zomato.com',
        appliedDate: daysAgo(5),
        status: 'Applied',
        source: 'Indeed',
        notes: 'Applied via easy apply.',
        priority: 'Medium',
      },
      {
        companyName: 'Swiggy',
        jobTitle: 'Associate Software Engineer',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹15 LPA',
        jobUrl: 'https://swiggy.com/careers',
        appliedDate: daysAgo(18),
        status: 'OA Cleared',
        source: 'Naukri',
        notes: 'Passed screening test.',
        followUpDate: daysFuture(5),
        priority: 'Medium',
      },
      {
        companyName: 'Cisco',
        jobTitle: 'Software Consulting Engineer',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹14 LPA',
        jobUrl: 'https://cisco.com',
        appliedDate: daysAgo(45),
        status: 'Withdrawn',
        source: 'Campus Placement',
        notes: 'Withdrawn due to accepting Microsoft offer.',
        priority: 'Low',
      },
      {
        companyName: 'Adobe',
        jobTitle: 'MTS-1 (Member of Technical Staff)',
        jobType: 'Full Time',
        location: 'Noida, India',
        salary: '₹24 LPA',
        jobUrl: 'https://adobe.com',
        appliedDate: daysAgo(12),
        status: 'Applied',
        source: 'LinkedIn',
        notes: 'Awaiting referral confirmation.',
        priority: 'High',
      },
      {
        companyName: 'Flipkart',
        jobTitle: 'SDE-1 UI',
        jobType: 'Full Time',
        location: 'Bangalore, India',
        salary: '₹20 LPA',
        jobUrl: 'https://flipkart.com',
        appliedDate: daysAgo(25),
        status: 'Interview',
        source: 'Company Portal',
        notes: 'Hiring manager round scheduled.',
        priority: 'High',
      },
    ];

    for (const appData of applicationsData) {
      const app = await Application.create({
        ...appData,
        userId: user1._id,
        resumeUrl: user1.resume.url,
        resumePublicId: user1.resume.publicId,
      });

      // Add timeline entries based on status progression
      await Timeline.create({
        applicationId: app._id,
        userId: user1._id,
        status: 'Applied',
        description: `Application submitted for ${app.jobTitle} at ${app.companyName}.`,
        date: app.appliedDate,
      });

      if (['Online Assessment', 'OA Cleared', 'Interview', 'Selected', 'Rejected', 'Withdrawn'].includes(app.status)) {
        if (app.status !== 'Applied') {
          await Timeline.create({
            applicationId: app._id,
            userId: user1._id,
            status: 'Online Assessment',
            description: 'Received and took online coding assessment.',
            date: new Date(app.appliedDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          });
        }
      }

      if (['OA Cleared', 'Interview', 'Selected'].includes(app.status)) {
        await Timeline.create({
          applicationId: app._id,
          userId: user1._id,
          status: 'OA Cleared',
          description: 'Passed Online Assessment with high test-case score.',
          date: new Date(app.appliedDate.getTime() + 6 * 24 * 60 * 60 * 1000),
        });
      }

      if (['Interview', 'Selected'].includes(app.status)) {
        await Timeline.create({
          applicationId: app._id,
          userId: user1._id,
          status: 'Interview',
          description: 'Technical Round 1: DSA, Trees, Graphs & Dynamic Programming.',
          date: new Date(app.appliedDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        });
      }

      if (app.status === 'Selected') {
        await Timeline.create({
          applicationId: app._id,
          userId: user1._id,
          status: 'Selected',
          description: 'Offer Letter Received! Package: ₹28 LPA CTC. 🚀🎉',
          date: new Date(app.appliedDate.getTime() + 20 * 24 * 60 * 60 * 1000),
        });
      }

      if (app.status === 'Rejected') {
        await Timeline.create({
          applicationId: app._id,
          userId: user1._id,
          status: 'Rejected',
          description: 'Application was not moved forward after review.',
          date: new Date(app.appliedDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        });
      }

      // Schedule interviews for applications in Interview status
      if (app.companyName === 'Google') {
        await Interview.create({
          applicationId: app._id,
          userId: user1._id,
          companyName: 'Google',
          jobTitle: app.jobTitle,
          round: 'Technical Round 2 (Algorithms & Data Structures)',
          interviewType: 'Google Meet',
          interviewDate: daysFuture(3),
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          notes: 'Revise Graph Algorithms (Dijkstra, Topological Sort) and Trie structures.',
          status: 'Scheduled',
        });
      }

      if (app.companyName === 'Razorpay') {
        await Interview.create({
          applicationId: app._id,
          userId: user1._id,
          companyName: 'Razorpay',
          jobTitle: app.jobTitle,
          round: 'Frontend System Design & Architecture',
          interviewType: 'Zoom',
          interviewDate: daysFuture(5),
          meetingLink: 'https://zoom.us/j/9876543210',
          notes: 'Design an infinite scrolling payment transactions feed with virtualization and caching.',
          status: 'Scheduled',
        });
      }

      if (app.companyName === 'Flipkart') {
        await Interview.create({
          applicationId: app._id,
          userId: user1._id,
          companyName: 'Flipkart',
          jobTitle: app.jobTitle,
          round: 'Hiring Manager & Culture Fit Round',
          interviewType: 'Microsoft Teams',
          interviewDate: daysFuture(8),
          meetingLink: 'https://teams.microsoft.com/l/meetup-join/12345',
          notes: 'Prepare STAR method stories for previous internships and college team projects.',
          status: 'Scheduled',
        });
      }
    }

    // 4. Create sample applications for User 2 (Sarah)
    await Application.create({
      userId: user2._id,
      companyName: 'Stripe',
      jobTitle: 'Frontend Engineer',
      jobType: 'Full Time',
      location: 'Remote',
      salary: '$120,000',
      status: 'Interview',
      source: 'LinkedIn',
      appliedDate: daysAgo(10),
    });

    console.log('💼 Seeded 13 realistic Job Applications, Timelines & Multi-Round Interviews.');
    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETE!');
    console.log('------------------------------------------------------');
    console.log('1. Admin Account:');
    console.log('   Email:    admin@jobtracker.com');
    console.log('   Password: Admin@123456');
    console.log('   Role:     admin');
    console.log('\n2. User Account (Fresher Portfolio):');
    console.log('   Email:    demo@jobtracker.com');
    console.log('   Password: Demo@123456');
    console.log('   Role:     user');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Error:', error.message);
    process.exit(1);
  }
};

importData();
