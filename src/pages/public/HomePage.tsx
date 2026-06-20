import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandBadge } from '../../components/branding/BrandBadge';
import './HomePage.css';

const TYPEWRITER_WORDS = ["operations", "exams", "progress tracking"];

const Typewriter = () => {
  const [currentText, setCurrentText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = 150;
    const deleteSpeed = 100;
    const pauseBetweenWords = 2000;
    
    let timer: ReturnType<typeof setTimeout>;
    const currentWord = TYPEWRITER_WORDS[wordIndex];

    if (isDeleting) {
      if (currentText === '') {
        timer = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
        }, 500);
      } else {
        timer = setTimeout(() => {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
        }, deleteSpeed);
      }
    } else {
      if (currentText === currentWord) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseBetweenWords);
      } else {
        timer = setTimeout(() => {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        }, typeSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex]);

  return (
    <>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
        {currentText}
      </span>
      <span className="text-primary font-light typewriter-pulse">|</span>
    </>
  );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <div 
      className={`glass p-6 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group faq-item ${isActive ? 'active' : ''}`}
      onClick={() => setIsActive(!isActive)}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{question}</h3>
        <span className="material-symbols-outlined text-primary transition-transform duration-300">
          {isActive ? 'close' : 'add'}
        </span>
      </div>
      <div className="accordion-content text-on-surface-variant">
        {answer}
      </div>
    </div>
  );
};

export function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerOpen]);

  useEffect(() => {
    // Add specific class to body for this page to handle global background if needed
    document.body.classList.add('home-page-body');
    return () => {
      document.body.classList.remove('home-page-body');
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-[#dee2f2] font-body relative overflow-x-hidden selection:bg-primary/30">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        {/* Background Orbs */}
        <div className="drift-orb orb-teal"></div>
        <div className="drift-orb orb-indigo"></div>
        
        {/* Grid pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-4 flex justify-between items-center">
          <BrandBadge textClassName="text-xl font-serif text-[#dee2f2] tracking-tighter" iconClassName="h-8 w-8" />
          
          <div className="hidden md:flex gap-8 items-center text-sm font-medium tracking-wide">
            <a href="#" className="text-[#dee2f2]/70 hover:text-primary transition-colors">Features</a>
            <a href="#" className="text-[#dee2f2]/70 hover:text-primary transition-colors">Roles</a>
            <a href="#" className="text-[#dee2f2]/70 hover:text-primary transition-colors">For Schools</a>
            <a href="#" className="text-[#dee2f2]/70 hover:text-primary transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[#dee2f2] hover:text-primary transition-colors text-sm font-semibold tracking-wide">Login</Link>
            <Link to="/register-org" className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-sm hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all">Register Org</Link>
          </div>

          <button 
            id="menu-open" 
            className="md:hidden text-[#dee2f2] hover:text-primary transition-colors"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-12">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Parikshan AI v2.0 Now Live
        </div>
        
        <h1 className="text-6xl md:text-8xl font-headline tracking-tighter mb-8 leading-[1.1]">
          Orchestrate <br/> 
          <Typewriter />
          <br/> with precision.
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-on-surface-variant font-light leading-relaxed mb-12">
          The ultimate intelligent framework uniting administrators, teachers, parents, and students in a seamless educational ecosystem.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/register-org" className="px-8 py-4 bg-[#dee2f2] text-[#0e131e] font-bold rounded-xl text-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 group">
            Start Your Sandbox <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
          <a href="#" className="px-8 py-4 glass text-[#dee2f2] font-bold rounded-xl text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            View Architecture <span className="material-symbols-outlined text-primary">architecture</span>
          </a>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="w-full border-y border-white/5 bg-white/5 py-4 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee-infinite flex items-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 pr-16 text-on-surface-variant font-label uppercase tracking-[0.2em] text-xs shrink-0">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">verified</span> SOC2 Compliant</span>
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">speed</span> &lt;50ms Latency</span>
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">analytics</span> Real-time Analytics</span>
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">group</span> 1M+ Students</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <h2 className="font-headline text-5xl md:text-6xl max-w-xl">
            A paradigm shift in <span className="text-primary italic">institutional design.</span>
          </h2>
          <p className="text-on-surface-variant max-w-sm text-sm">
            Forget disjointed portals. Parikshan AI unifies every persona into a single, cohesive engine of productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-8 rounded-3xl group feature-card-hover-container transition-transform hover:-translate-y-2">
            <div className="feature-card-gradient"></div>
            <div className="feature-card-content">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
              </div>
              <h3 className="font-bold text-xl mb-3">Admin Command</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Bird's eye view over multi-branch operations. Govern users, classes, and global policies instantly.
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl group feature-card-hover-container transition-transform hover:-translate-y-2 lg:translate-y-8">
            <div className="feature-card-gradient"></div>
            <div className="feature-card-content">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">cast_for_education</span>
              </div>
              <h3 className="font-bold text-xl mb-3">Teacher Hub</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                AI-assisted question generation, automated grading, and granular student performance metrics.
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl group feature-card-hover-container transition-transform hover:-translate-y-2">
            <div className="feature-card-gradient"></div>
            <div className="feature-card-content">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">family_home</span>
              </div>
              <h3 className="font-bold text-xl mb-3">Parent Portal</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Real-time visibility into academic progression, upcoming exams, and comprehensive analytics.
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl group feature-card-hover-container transition-transform hover:-translate-y-2 lg:translate-y-8">
            <div className="feature-card-gradient"></div>
            <div className="feature-card-content">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">school</span>
              </div>
              <h3 className="font-bold text-xl mb-3">Student Arena</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Focus-mode exam interfaces, instant results, and personalized learning trajectories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section className="py-24 px-8 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 z-10">
            <h2 className="font-headline text-5xl mb-6">Insight over intuition.</h2>
            <p className="text-lg text-on-surface-variant mb-10 leading-relaxed">
              Our advanced analytics engine doesn't just show data; it predicts trajectories. Understand strengths, identify gaps, and intervene before it's too late.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 mt-1"><span className="material-symbols-outlined text-primary">data_usage</span></div>
                <div>
                  <h4 className="font-bold text-lg">Cohort Comparisons</h4>
                  <p className="text-sm text-on-surface-variant">Benchmark group performance against historical institutional data.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 mt-1"><span className="material-symbols-outlined text-primary">psychology</span></div>
                <div>
                  <h4 className="font-bold text-lg">AI Cognitive Mapping</h4>
                  <p className="text-sm text-on-surface-variant">Identify specific knowledge gaps down to the sub-topic level.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 w-full relative">
            <div className="glass rounded-[2rem] p-6 shadow-2xl relative z-10 border-t border-l border-white/20">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="font-bold text-lg">Performance Metrics</div>
                <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-md">LIVE</div>
              </div>
              <div className="h-64 w-full flex items-end justify-between gap-2 px-4">
                <div className="w-1/6 bg-[#384667] rounded-t-lg h-[40%] hover:bg-primary transition-colors cursor-pointer relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white text-black px-2 py-1 rounded">40%</div>
                </div>
                <div className="w-1/6 bg-[#384667] rounded-t-lg h-[60%] hover:bg-primary transition-colors cursor-pointer relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white text-black px-2 py-1 rounded">60%</div>
                </div>
                <div className="w-1/6 bg-primary rounded-t-lg h-[85%] cursor-pointer relative group shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white text-black px-2 py-1 rounded">85%</div>
                </div>
                <div className="w-1/6 bg-[#384667] rounded-t-lg h-[50%] hover:bg-primary transition-colors cursor-pointer relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white text-black px-2 py-1 rounded">50%</div>
                </div>
                <div className="w-1/6 bg-[#384667] rounded-t-lg h-[75%] hover:bg-primary transition-colors cursor-pointer relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white text-black px-2 py-1 rounded">75%</div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-1/2 -right-10 w-32 h-32 bg-primary blur-[100px] opacity-40 z-0"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <h2 className="font-headline text-5xl text-center mb-16">Academic Voices.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl">
            <p className="font-serif italic text-lg text-on-surface-variant mb-8 leading-relaxed">"The administrative burden used to keep our heads down. Parikshan AI allowed us to look up and focus on what matters: pedagogy."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container"></div>
              <div>
                <div className="font-bold">Dr. Alistair Vance</div>
                <div className="text-xs text-primary uppercase font-label">Principal, St. Jude's</div>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl">
            <p className="font-serif italic text-lg text-on-surface-variant mb-8 leading-relaxed">"Security was our primary concern for digital exams. The AI-proctoring engine is both ethical and unshakeable."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container"></div>
              <div>
                <div className="font-bold">Sarah Jenkins</div>
                <div className="text-xs text-primary uppercase font-label">IT Director, Nexus Academy</div>
              </div>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl">
            <p className="font-serif italic text-lg text-on-surface-variant mb-8 leading-relaxed">"A masterclass in UI design. Our teachers actually enjoy using the dashboard, which is a first for our institution."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container"></div>
              <div>
                <div className="font-bold">Marcello Ricci</div>
                <div className="text-xs text-primary uppercase font-label">Head of Innovation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organization Access / Registration Form */}
      <section className="py-24 bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto px-8">
          <div className="glass p-8 md:p-14 rounded-[3rem] shadow-2xl relative">
            <div className="text-center mb-10">
              <h2 className="font-headline text-4xl mb-3">Request Access.</h2>
              <p className="text-on-surface-variant text-sm">Step into the future of academic management.</p>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 border-b border-white/10 pb-1.5 transition-all focus-within:border-primary/50 group">
                  <label className="text-[10px] font-label uppercase tracking-widest text-primary/60 group-focus-within:text-primary">Organization Name</label>
                  <input type="text" placeholder="Institution Ltd." className="w-full bg-transparent border-none focus:ring-0 px-0 py-1 text-on-surface placeholder:text-on-surface/20 outline-none" />
                </div>
                <div className="space-y-1.5 border-b border-white/10 pb-1.5 transition-all focus-within:border-primary/50 group">
                  <label className="text-[10px] font-label uppercase tracking-widest text-primary/60 group-focus-within:text-primary">Full Name</label>
                  <input type="text" placeholder="Alex Rivera" className="w-full bg-transparent border-none focus:ring-0 px-0 py-1 text-on-surface placeholder:text-on-surface/20 outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 border-b border-white/10 pb-1.5 transition-all focus-within:border-primary/50 group">
                  <label className="text-[10px] font-label uppercase tracking-widest text-primary/60 group-focus-within:text-primary">Role</label>
                  <select className="w-full bg-transparent border-none focus:ring-0 px-0 py-1 text-on-surface appearance-none mt-0 outline-none">
                    <option className="bg-surface text-[#dee2f2]">Principal</option>
                    <option className="bg-surface text-[#dee2f2]">Administrator</option>
                    <option className="bg-surface text-[#dee2f2]">IT Lead</option>
                  </select>
                </div>
                <div className="space-y-1.5 border-b border-white/10 pb-1.5 transition-all focus-within:border-primary/50 group">
                  <label className="text-[10px] font-label uppercase tracking-widest text-primary/60 group-focus-within:text-primary">Work Email</label>
                  <input type="email" placeholder="alex@institution.edu" className="w-full bg-transparent border-none focus:ring-0 px-0 py-1 text-on-surface placeholder:text-on-surface/20 outline-none" />
                </div>
              </div>
              
              <button type="submit" className="w-full mt-6 py-4 bg-primary text-on-primary font-bold rounded-xl text-lg hover:shadow-[0_10px_25px_-5px_rgba(107,251,154,0.3)] active:scale-[0.98] transition-all">
                Submit Registration
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 px-8 max-w-4xl mx-auto">
        <h2 className="font-headline text-4xl text-center mb-16">Inquiries.</h2>
        <div className="space-y-4">
          <FAQItem 
            question="How secure is student data?" 
            answer="We employ AES-256 encryption at rest and TLS 1.3 in transit, compliant with global GDPR and FERPA standards." 
          />
          <FAQItem 
            question="Does it integrate with existing LMS?" 
            answer="Yes, Parikshan AI provides robust API endpoints and LTI compliance for seamless integration with Canvas, Moodle, and Google Classroom." 
          />
          <FAQItem 
            question="What is the implementation timeline?" 
            answer="A typical institutional deployment takes between 2 to 4 weeks, including data migration and staff training sessions." 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full pt-20 pb-10 bg-[#0e131e]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-12 max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1">
            <div className="font-serif text-xl text-[#dee2f2] mb-6">Parikshan AI</div>
            <p className="text-sm text-[#dee2f2]/50 leading-relaxed mb-4">The Digital Luminary Framework for modern institutional intelligence.</p>
            <div className="text-xs text-primary font-label tracking-widest">EST. 2030</div>
          </div>
          <div>
            <div className="font-bold text-sm mb-6 text-on-background uppercase tracking-widest">Platform</div>
            <ul className="space-y-4 text-sm font-sans antialiased">
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">Features</a></li>
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">Documentation</a></li>
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">Academic Integrity</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-sm mb-6 text-on-background uppercase tracking-widest">Company</div>
            <ul className="space-y-4 text-sm font-sans antialiased">
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">About Us</a></li>
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">Support</a></li>
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-sm mb-6 text-on-background uppercase tracking-widest">Legal</div>
            <ul className="space-y-4 text-sm font-sans antialiased">
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-[#dee2f2]/50 hover:text-[#4ade80] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-20 border-t border-white/5 pt-10 text-center text-xs text-[#dee2f2]/30 uppercase tracking-[0.3em]">
          © 2030 Parikshan AI. The Digital Luminary Framework.
        </div>
      </footer>

      {/* Navigation Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        id="drawer-overlay"
        onClick={() => setDrawerOpen(false)}
      ></div>

      {/* Navigation Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-xs z-[70] transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`} 
        id="nav-drawer"
      >
        <div className="glass h-full w-full p-8 flex flex-col">
          <div className="flex justify-end mb-12">
            <button 
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-on-surface" 
              onClick={() => setDrawerOpen(false)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-8">
            <a href="#" className="text-2xl font-serif text-[#dee2f2]/70 hover:text-primary transition-all duration-300">Features</a>
            <a href="#" className="text-2xl font-serif text-[#dee2f2]/70 hover:text-primary transition-all duration-300">Roles</a>
            <a href="#" className="text-2xl font-serif text-[#dee2f2]/70 hover:text-primary transition-all duration-300">For Schools</a>
            <a href="#" className="text-2xl font-serif text-[#dee2f2]/70 hover:text-primary transition-all duration-300">Pricing</a>
            
            <div className="pt-8 mt-4 border-t border-white/10 flex flex-col gap-4">
              <Link 
                to="/login"
                className="w-full px-6 py-4 text-[#dee2f2] font-semibold transition-all bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-left flex justify-between items-center"
              >
                Login <span className="material-symbols-outlined">login</span>
              </Link>
              <Link 
                to="/register-org"
                className="w-full px-6 py-4 bg-primary text-on-primary font-bold rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.2)] active:scale-95 transition-all text-left flex justify-between items-center"
              >
                Register Your Org <span className="material-symbols-outlined">app_registration</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="pt-8 border-t border-white/10">
              <div className="mb-4">
                <BrandBadge textClassName="text-xl font-serif text-[#dee2f2] tracking-tighter" iconClassName="h-8 w-8" />
              </div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest">Intelligence Refined</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
