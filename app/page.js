'use client'
import Navbar from "./components/Navbar"
import { ArrowRight, Layers, CodeIcon, Zap, Github, Linkedin, Twitter } from 'lucide-react'
import { useRouter } from 'next/navigation';



const FEATURES = [
  {
    icon: Layers,
    title: "Build Experience",
    description: "Gain credible tutoring skills by helping other students"
  },
  {
    icon: CodeIcon,
    title: "Build Skills",
    description: "Recieve help in your classes and skills"
  },
  {
    icon: Zap,
    title: "Build Networks",
    description: "Meet new people to build career connections"
  }
];

const TEAM = [
  {
    name: "Advait Pandey",
    social: {
      personal: "https://github.com/AdvaitP-1",
      linkedin: "https://www.linkedin.com/in/advp/",
    }
  },
  {
    name: "Reewaj Adhikari",
    social: {
      personal: "https://github.com/ReewajAdhikari",
      linkedin: "https://www.linkedin.com/in/ra27/",
    }
  },
  {
    name: "Aniketh Aravind",
    social: {
      personal: "https://github.com/Ania13",
      linkedin: "https://www.linkedin.com/in/aniketharvind/",
    }
  },
  {
    name: "Marwan Abdelgawad",
    social: {
      personal: "https://github.com/mr1git",
      linkedin: "https://www.linkedin.com/in/meabdelg/",
    }
  }
];

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl text-center hover:scale-[1.02] transition-all shadow-lg">
      <Icon className="mx-auto mb-4 text-black" size={48} />
      <h3 className="text-xl font-bold mb-2 text-black">{title}</h3>
      <p className="text-black/60">{description}</p>
    </div>
  );
}

function TeamMember({ name, social }) {
  return (
    <div className="group relative">
      <div className="overflow-hidden rounded-xl bg-white p-6 text-center hover:bg-gray-50 transition-all shadow-lg">
        <h3 className="text-xl font-bold mb-1 text-black">{name}</h3>
        <div className="flex justify-center space-x-4">
          <a href={social.personal} className="text-black/60 hover:text-black transition-colors">
            <Github size={20} />
          </a>
          <a href={social.linkedin} className="text-black/60 hover:text-black transition-colors">
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <>
      <div className="fixed inset-0 w-full h-full">
        <img 
          src="/background.jpg" 
          alt="background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>
      
      <div className="relative">
        <Navbar />
        <main className="container mx-auto px-4 pt-32">
          <section className="text-center mb-32">
            <h1 className="text-6xl font-black tracking-tighter mb-4 text-white">
              Learning Tree
            </h1>
            <p className="text-xl text-white/80 max-w-xl mx-auto mb-8">
              Branch Your Connections in Your Career and Community
            </p>
            <div className="flex justify-center space-x-4">
              
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-8 mb-32">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </section>

          <section className="mb-32">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-white">About Us</h2>
              <p className="text-lg text-white/80 mb-8">
                Learning Tree is a student-driven tutoring platform that connects learners with peer tutors 
                within their academic community. We believe in the power of collaborative learning, where 
                students can both share their knowledge and receive help in their academic journey.
              </p>
              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="bg-white p-6 rounded-xl hover:scale-[1.02] transition-all shadow-lg">
                  <h3 className="text-xl font-bold mb-2 text-black">Our Mission</h3>
                  <p className="text-black/60">
                    To create a supportive learning environment where students can develop their teaching skills,
                    build their academic portfolio, and help fellow students succeed in their courses.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl hover:scale-[1.02] transition-all shadow-lg">
                  <h3 className="text-xl font-bold mb-2 text-black">Our Vision</h3>
                  <p className="text-black/60">
                    To foster a community where peer-to-peer learning strengthens academic success, 
                    builds meaningful connections, and prepares students for future career opportunities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-32">
            <h2 className="text-4xl font-bold text-center mb-16 text-white">Meet Our Team</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {TEAM.map((member, index) => (
                <TeamMember key={index} {...member} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}