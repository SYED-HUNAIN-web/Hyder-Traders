'use client';

import React from 'react';
import Container from '@/components/shared/Container';
import { CheckCircle2, Shield, Zap, Wrench, ClipboardList, MessageSquare, Phone, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

const InstallationPage = () => {
  const steps = [
    {
      icon: <ClipboardList size={24} />,
      title: 'Site Survey',
      desc: 'Our experts visit your location to assess roof space and energy needs.'
    },
    {
      icon: <Zap size={24} />,
      title: 'Custom Design',
      desc: 'We design a tailored solar solution for maximum energy harvesting.'
    },
    {
      icon: <Wrench size={24} />,
      title: 'Installation',
      desc: 'Professional team installs your system with premium materials and safety.'
    },
    {
      icon: <CheckCircle2 size={24} />,
      title: 'Testing & Handover',
      desc: 'Rigorous testing to ensure efficiency before final system handover.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Solar Installation" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Professional <span className="text-[#ff6600]">Solar System</span> Installation in Hyderabad
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              Switch to clean energy and slash your electricity bills with the most trusted solar installation experts in the region.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#quote" className="bg-[#ff6600] text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-500/20 active:scale-95 text-center">
                Get a Free Quote
              </Link>
              <Link href="tel:+923001030542" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-white/20 transition-all text-center flex items-center justify-center gap-2">
                <Phone size={18} /> Call Us Now
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Stats */}
      <div className="relative -mt-10 lg:-mt-16 z-20 pb-20">
        <Container>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">
                <CountUp end={500} suffix="+" />
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Installations</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">
                <CountUp end={25} suffix="Y" />
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Warranty</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl font-black text-gray-900 mb-1 tracking-tight">
                <CountUp end={98} suffix="%" />
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Satisfaction</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-4xl font-black text-[#ff6600] mb-1 tracking-tight">FREE</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Site Survey</div>
            </div>
          </div>
        </Container>
      </div>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Why Choose <span className="text-[#ff6600]">Hyder Traders?</span></h2>
            <p className="text-gray-500 font-medium leading-relaxed">We don't just install solar panels; we engineer sustainable energy solutions with the highest quality standards in Pakistan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff6600] mb-8 group-hover:scale-110 transition-transform">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight uppercase">Premium Equipment</h3>
              <p className="text-gray-500 text-sm leading-relaxed">We only use top-tier N-Type panels from Jinko/Longi and high-efficiency hybrid inverters from Inverex.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff6600] mb-8 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight uppercase">Maximum Efficiency</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Our advanced structure designs and wiring techniques ensure minimum energy loss and maximum output.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff6600] mb-8 group-hover:scale-110 transition-transform">
                <Wrench size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight uppercase">Expert Engineering</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Our team of certified solar engineers has over 10 years of experience in complex electrical installations.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Installation Process */}
      <section className="py-24 bg-[#1a1a1a] text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 L100 0 L100 100 Z" fill="#ff6600" />
          </svg>
        </div>
        
        <Container className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Our 4-Step <br /><span className="text-[#ff6600]">Seamless</span> Process</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-12">We value your time and comfort. Our installation process is designed to be completely hassle-free and transparent from day one.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#ff6600] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-sm mb-2">{step.title}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full relative">
              <div className="aspect-square bg-gray-800 rounded-[3rem] overflow-hidden border-8 border-gray-800/50 shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1624397640148-949b1732bb0a?q=80&w=2000&auto=format&fit=crop" 
                  className="w-full h-full object-cover" 
                  alt="Solar Team" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex -space-x-4">
                      {[1,2,3].map(n => (
                        <div key={n} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                          <img src={`https://i.pravatar.cc/150?u=${n}`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Team of Experts</div>
                  </div>
                  <p className="text-white text-sm font-bold leading-relaxed">
                    "Our team handles the paperwork and net metering applications so you can sit back and relax."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Inquiry Form Section */}
      <section id="quote" className="py-24">
        <Container>
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 lg:p-20 bg-orange-50">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight">Request a <span className="text-[#ff6600]">Site Survey</span></h2>
              <p className="text-gray-600 leading-relaxed mb-10 font-medium">Ready to start your solar journey? Fill out the form and our expert engineers will contact you within 24 hours for a detailed survey.</p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#ff6600] shadow-sm">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call our support</div>
                    <div className="text-xl font-black text-gray-900 tracking-tight">+92 3001030542</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#ff6600] shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Our Office</div>
                    <div className="text-xl font-black text-gray-900 tracking-tight">Shop No. 9, Maskan Complex, Near Shabbir Biryani Hyderabad.</div>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#ff6600] shadow-sm">
                    <Star size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Certified Partner</div>
                    <div className="text-xl font-black text-gray-900 tracking-tight">Tier-1 Solar Solutions</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 p-12 lg:p-20">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Your Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                    <input type="tel" placeholder="+92 3XX XXXXXXX" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Average Monthly Bill (PKR)</label>
                  <input type="number" placeholder="25,000" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">System Size Required</label>
                  <select className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none appearance-none">
                    <option>Don't know (Need assessment)</option>
                    <option>3KW System</option>
                    <option>5KW System</option>
                    <option>10KW System</option>
                    <option>15KW+ (Commercial)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Message</label>
                  <textarea rows={4} placeholder="Tell us about your roof space or specific requirements..." className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none resize-none"></textarea>
                </div>
                
                <button type="submit" className="w-full bg-[#ff6600] text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 mt-4">
                  <MessageSquare size={18} /> Submit Application
                </button>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-[#ff6600]">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">Ready to generate your own electricity?</h3>
              <p className="text-white/80 font-bold uppercase text-xs tracking-widest mt-2">Zero commitment site survey available today.</p>
            </div>
            <Link href="https://wa.me/923001030542" target="_blank" className="bg-white text-[#ff6600] px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap">
              Chat on WhatsApp
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default InstallationPage;
