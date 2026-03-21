import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  HiOutlineSparkles, 
  HiOutlineLightningBolt, 
  HiOutlineChartBar, 
  HiOutlineChatAlt2,
  HiOutlineTranslate,
  HiOutlineEmojiHappy,
  HiOutlineUserGroup,
  HiOutlineArrowNarrowRight,
  HiCheckCircle
} from 'react-icons/hi';
import NovaLogo from '../components/ui/NovaLogo';

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04)'
};

const gradientText = {
  background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  color: 'transparent'
};

const HomePage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 100]);

  // Soft Background Gradients
  const BackgroundBlobs = () => (
    <div className="fixed inset-0 min-h-screen overflow-hidden pointer-events-none" style={{ backgroundColor: '#F8FAFC', zIndex: -1 }}>
      <div className="absolute top-0 left-0 w-full h-[500px]" style={{ background: 'linear-gradient(180deg, #EEF2FF 0%, rgba(248,250,252,0) 100%)' }}></div>
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply filter blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)' }}
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(255,255,255,0) 70%)' }}
      />
    </div>
  );

  return (
    <div className="relative min-h-screen text-[#0F172A] font-sans selection:bg-indigo-500/20 pt-20 overflow-x-hidden">
      <BackgroundBlobs />

      {/* 1. NAVBAR */}
      <nav 
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-black/5 bg-white/60 backdrop-blur-md h-[72px] flex items-center"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between w-full">
          <div className="flex items-center gap-2 shrink-0">
            <NovaLogo className="w-8 h-8 drop-shadow-md" />
            <span className="text-[#0F172A] font-extrabold text-xl tracking-tight">NovaTalk</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-[#475569]">
            <a href="#features" className="hover:text-[#0F172A] transition-colors">Features</a>
            <a href="#intelligence" className="hover:text-[#0F172A] transition-colors">Intelligence</a>
            <a href="#about" className="hover:text-[#0F172A] transition-colors">About</a>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <Link to="/login" className="text-[15px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">
              Login
            </Link>
            <Link 
              to="/register" 
              className="text-[15px] font-semibold text-white px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-[0_8px_16px_rgba(99,102,241,0.25)] whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-[75vh] flex items-center px-6 lg:px-8 max-w-7xl mx-auto w-full py-16 md:py-20 pb-10 md:pb-16 mb-10 md:mb-14">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 w-full">
          <motion.div 
            className="w-full max-w-xl text-center lg:text-left z-10 shrink-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 bg-indigo-50 border border-indigo-100 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse"></span>
            <span className="text-[13px] font-semibold text-[#6366F1] tracking-wide uppercase">Introducing NovaTalk</span>
          </motion.div>
          
          <h1 className="text-[44px] sm:text-[56px] lg:text-[64px] font-extrabold text-[#0F172A] tracking-tight leading-[1.1] mb-6">
            Conversations <br />
            <span style={gradientText}>Reimagined.</span>
          </h1>
          
          <p className="text-[16px] sm:text-[18px] text-[#475569] mb-10 max-w-[520px] mx-auto lg:mx-0 leading-[1.6]">
            NovaTalk transforms team communication into smart, adaptive intelligence. Experience the AI-powered chat platform of tomorrow, seamlessly integrated into your workflow.
          </p>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
            <Link 
              to="/register" 
              className="text-center font-bold text-[18px] text-white px-10 py-4 rounded-full transition-all hover:scale-105 shadow-[0_8px_30px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 group whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)' }}
            >
              Start for free
              <HiOutlineArrowNarrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Hero Right - Minimal Chat Mockup */}
        <motion.div 
          className="w-full lg:flex-1 relative z-10 flex justify-center lg:justify-end shrink-0"
          style={{ y: y1 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {/* Soft Shape Behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-[3rem] bg-gradient-to-tr from-indigo-100 to-cyan-50 rotate-6 filter blur-xl opacity-70"></div>
          
          {/* Mockup Container */}
          <div className="relative w-full max-w-[440px] rounded-[24px] overflow-hidden" style={glassCardStyle}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-black/5 bg-white/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#6366F1]">
                    <HiOutlineSparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-[#0F172A] font-bold text-[14px] leading-none mb-1">NovaTalk AI</h3>
                    <p className="text-[11px] font-medium text-[#10B981] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Online
                    </p>
                  </div>
               </div>
            </div>
            
            {/* Chat Body */}
            <div className="p-5 flex flex-col gap-5 bg-white/30 h-[300px] overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                className="self-end max-w-[85%] p-3.5 rounded-2xl rounded-tr-sm bg-[#6366F1] text-[13px] text-white shadow-sm break-words"
              >
                Summarize our marketing meeting from today.
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}
                className="self-start w-[90%] p-4 rounded-2xl rounded-tl-sm text-[13px] shadow-sm bg-white border border-[#EEF2FF]"
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <HiOutlineSparkles className="text-[#6366F1]" size={14} />
                  <span className="font-bold text-[#6366F1] text-[11px] uppercase tracking-wider">Analysis complete</span>
                </div>
                <p className="mb-2 text-[#0F172A] font-medium leading-[1.5]">Key takeaways:</p>
                <ul className="space-y-1.5 text-[#475569]">
                  <li className="flex items-start gap-1.5"><HiCheckCircle className="text-[#06B6D4] mt-0.5 shrink-0" size={14} /> <span>Q4 budget approved (+15%)</span></li>
                  <li className="flex items-start gap-1.5"><HiCheckCircle className="text-[#06B6D4] mt-0.5 shrink-0" size={14} /> <span>New ad creatives launch Tuesday</span></li>
                </ul>
              </motion.div>
            </div>
            
            {/* Input Form */}
            <div className="p-4 bg-white/70 border-t border-black/5 flex gap-3 items-center">
              <div className="flex-1 rounded-full bg-white border border-slate-200 px-4 py-2.5 text-[13px] text-[#94A3B8] shadow-inner">
                Ask AI anything...
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md bg-[#6366F1] hover:scale-105 transition-transform cursor-pointer">
                <HiOutlineArrowNarrowRight className="text-white text-lg" />
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-16 md:py-24 relative z-10 px-6 lg:px-8 max-w-7xl mx-auto w-full mt-10 md:mt-14 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-center text-[#0F172A]">
            Built for modern <span style={gradientText}>collaboration.</span>
          </h2>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl text-center">
            Everything you need to manage your team's communication in one place, supercharged by natively integrated artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch mt-4">
          {[
            { icon: HiOutlineLightningBolt, title: "Smart Conversations", color: "text-[#6366F1]", bg: "bg-indigo-50", desc: "Automated summaries, intelligent replies, and context-aware suggestions generated in real-time." },
            { icon: HiOutlineUserGroup, title: "Real-Time Sync", color: "text-[#06B6D4]", bg: "bg-cyan-50", desc: "Lightning fast delivery wrapped in a beautiful, distraction-free environment that teams love." },
            { icon: HiOutlineChartBar, title: "Data Insights", color: "text-[#8B5CF6]", bg: "bg-purple-50", desc: "Live sentiment tracking, engagement heatmaps, and productivity analytics for your entire space." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="p-8 rounded-[24px] relative group transition-all text-left flex flex-col h-full"
              style={glassCardStyle}
            >
              <div className={`w-12 h-12 rounded-[14px] mb-6 flex items-center justify-center text-2xl ${feature.color} ${feature.bg} shadow-sm border border-black/5`}>
                <feature.icon />
              </div>
              <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">{feature.title}</h3>
              <p className="text-[15px] text-[#475569] leading-[1.6] flex-1">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. AI INTELLIGENCE SHOWCASE */}
      <section id="intelligence" className="py-20 md:py-24 relative z-10 w-full bg-white border-y border-slate-100 mt-16 md:mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left - Neural Visualizer */}
          <motion.div 
            style={{ y: y2 }}
            className="order-2 lg:order-1 relative h-[350px] w-full flex items-center justify-center"
          >
            <div className="absolute inset-0">
               {/* Simplified animated SVG network representation */}
               <svg viewBox="0 0 400 350" className="w-full h-full opacity-40">
                 <motion.path 
                   d="M200,175 L100,80 M200,175 L300,60 M200,175 L50,250 M200,175 L350,220" 
                   stroke="#6366F1" strokeWidth="2" strokeDasharray="5,5"
                   animate={{ strokeDashoffset: [0, 100] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                 />
                 <circle cx="200" cy="175" r="40" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2"/>
                 <circle cx="100" cy="80" r="15" fill="#F0FDFA" stroke="#06B6D4" strokeWidth="2"/>
                 <circle cx="300" cy="60" r="20" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2"/>
                 <circle cx="50" cy="250" r="25" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="2"/>
                 <circle cx="350" cy="220" r="15" fill="#F0FDFA" stroke="#06B6D4" strokeWidth="2"/>
                 
                 {/* Floating data packets */}
                 <motion.circle cx="100" cy="80" r="4" fill="#6366F1" animate={{ cx: [100, 200], cy: [80, 175], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                 <motion.circle cx="350" cy="220" r="4" fill="#06B6D4" animate={{ cx: [350, 200], cy: [220, 175], opacity: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />
               </svg>
            </div>
            
            <div className="w-24 h-24 rounded-full flex items-center justify-center z-10 shadow-[0_0_60px_rgba(99,102,241,0.3)] bg-white border border-indigo-100 relative">
              <HiOutlineChatAlt2 className="text-[#6366F1] text-4xl" />
            </div>
          </motion.div>

          {/* Right - Text */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <h2 className="text-[32px] sm:text-[40px] font-extrabold text-[#0F172A] mb-6 leading-[1.15] tracking-tight relative inline-block">
              Your communication.
              <br/>
              <span className="relative">
                 Now thinking.
                 <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] opacity-50 rounded-full"></div>
              </span>
            </h2>
            <p className="text-[16px] text-[#475569] mb-8 max-w-[500px] leading-[1.6]">
              Equipped with state-of-the-art language models, NovaTalk doesn't just transmit messages—it understands them, organizes them, and acts on them.
            </p>
            
            <div className="space-y-4">
              {[
                "Instant deep-context message summarization",
                "Live multi-lingual translation streams",
                "Advanced sentiment and emotion detection",
                "Predictive grammar & professional tone adjustment"
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3.5"
                >
                  <HiCheckCircle className="text-[#6366F1] text-xl shrink-0" />
                  <span className="text-[#0F172A] font-medium text-[15px]">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-20 md:py-24 px-6 lg:px-8 max-w-5xl mx-auto relative z-10 mt-16 md:mt-24 w-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full rounded-[32px] px-10 py-14 lg:p-20 text-center relative overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col items-center justify-center"
        >
          {/* Subtle Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white opacity-80 pointer-events-none"></div>

          <h2 className="text-[36px] lg:text-[48px] font-extrabold text-[#0F172A] mb-5 relative z-10 tracking-tight leading-tight text-center w-full">
            Step into the future of work.
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#475569] mb-10 max-w-2xl mx-auto relative z-10 leading-[1.6] text-center w-full">
            Join thousands of teams who have already upgraded their workflow with NovaTalk's AI-driven platform.
          </p>
          
          <div className="flex justify-center w-full relative z-10 mt-2">
            <Link 
              to="/register" 
              className="flex items-center justify-center font-semibold text-[16px] text-white px-10 py-4 rounded-full transition-all hover:scale-105 shadow-[0_8px_30px_rgba(99,102,241,0.3)]"
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)' }}
            >
              Start your free workspace
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-slate-200 relative z-10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 text-left">
              <div className="flex items-center gap-2 mb-5">
                <NovaLogo className="w-8 h-8 drop-shadow-sm" />
                <span className="text-[#0F172A] font-extrabold text-xl tracking-tight">NovaTalk</span>
              </div>
              <p className="text-[#475569] text-[14px] max-w-[300px] leading-[1.6]">
                Next-generation intelligent communication platform integrating cutting edge AI into modern team workflows.
              </p>
            </div>
            
            <div className="text-left">
              <h4 className="text-[#0F172A] font-bold text-[14px] mb-5 tracking-wide uppercase">Product</h4>
              <ul className="space-y-3 text-[14px] text-[#64748B]">
                <li><a href="#" className="hover:text-[#6366F1] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#6366F1] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#6366F1] transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div className="text-left">
              <h4 className="text-[#0F172A] font-bold text-[14px] mb-5 tracking-wide uppercase">Company</h4>
              <ul className="space-y-3 text-[14px] text-[#64748B]">
                <li><a href="#" className="hover:text-[#6366F1] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#6366F1] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#6366F1] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#94A3B8]">
            <p>© {new Date().getFullYear()} NovaTalk AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#0F172A] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#0F172A] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
