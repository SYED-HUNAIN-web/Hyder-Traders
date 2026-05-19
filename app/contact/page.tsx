'use client';

import React from 'react';
import Container from '@/components/shared/Container';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

const ContactPage = () => {
  const contactInfo = [
    {
      icon: <Phone size={24} />,
      title: 'Call Us',
      value: '+92 300 1030542',
      desc: 'Available Mon-Sat, 9am - 9pm',
      link: 'tel:+923001030542'
    },
    {
      icon: <Mail size={24} />,
      title: 'Email Us',
      value: 'hydertraders830@gmail.com',
      desc: 'We usually reply within 24 hours',
      link: 'mailto:hydertraders830@gmail.com'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Our Office',
      value: 'Shop No. 9, Maskan Complex',
      desc: 'Near Shabbir Biryani Hyderabad.',
      link: 'https://maps.google.com'
    },
    {
      icon: <Clock size={24} />,
      title: 'Working Hours',
      value: '09:00 AM - 09:00 PM',
      desc: 'Friday Off',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#1a1a1a] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="0" r="80" stroke="#ff6600" strokeWidth="0.5" />
            <circle cx="100" cy="0" r="60" stroke="#ff6600" strokeWidth="0.5" />
            <circle cx="100" cy="0" r="40" stroke="#ff6600" strokeWidth="0.5" />
          </svg>
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Get in <span className="text-[#ff6600]">Touch</span> with Us
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Have questions about solar systems? We're here to help you power your home with clean energy.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Cards */}
      <section className="py-20 -mt-16 relative z-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, i) => (
              <a 
                href={info.link} 
                key={i} 
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff6600] mb-6 group-hover:scale-110 transition-transform">
                  {info.icon}
                </div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{info.title}</h3>
                <div className="text-lg font-black text-gray-900 mb-1 tracking-tight">{info.value}</div>
                <p className="text-gray-500 text-xs font-medium">{info.desc}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Form */}
            <div className="lg:w-3/5 bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Send us a <span className="text-[#ff6600]">Message</span></h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                    <input type="text" placeholder="Your Name" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                    <input type="email" placeholder="example@mail.com" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Subject</label>
                  <input type="text" placeholder="Inquiry about Solar Panels" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Your Message</label>
                  <textarea rows={6} placeholder="How can we help you today?" className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#ff6600]/20 focus:bg-white transition-all font-bold text-gray-900 outline-none resize-none"></textarea>
                </div>
                
                <button type="submit" className="w-full bg-[#ff6600] text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3">
                  <Send size={18} /> Send Message
                </button>
              </form>
            </div>

            {/* Map Placeholder/Info */}
            <div className="lg:w-2/5 flex flex-col gap-6">
              <div className="bg-[#ff6600] p-10 rounded-[2.5rem] text-white flex-grow relative overflow-hidden group shadow-xl shadow-orange-200">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-6 tracking-tight">Visit Our Store</h3>
                  <p className="text-white/80 font-medium mb-10 leading-relaxed text-sm">
                    Feel free to visit our showroom in Hyderabad to see our premium range of solar products in person.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                      </div>
                      <a href="https://www.facebook.com/profile.php?id=100070319131089" target="_blank" className="text-sm font-bold hover:underline">fb.com/hydertraders</a>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </div>
                      <a href="https://www.instagram.com/hyder_trader/" target="_blank" className="text-sm font-bold hover:underline">@hyder_trader</a>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <MessageSquare size={20} />
                      </div>
                      <a href="https://wa.me/923001030542" target="_blank" className="text-sm font-bold hover:underline">+92 300 1030542</a>
                    </div>
                  </div>
                </div>
                
                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
              </div>

              <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden h-64 relative group">
                 <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3604.388856325248!2d68.3658569!3d25.391791100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394c71d81dccb19d%3A0xc8666d99c061cd75!2sHyder%20traders!5e0!3m2!1sen!2s!4v1778923824811!5m2!1sen!2s" 
                   className="w-full h-full border-0 rounded-[2rem] transition-transform duration-700 group-hover:scale-110" 
                   allowFullScreen={true}
                   loading="lazy"
                   referrerPolicy="no-referrer-when-downgrade"
                 ></iframe>
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* FAQ CTA */}
      <section className="py-20 bg-white border-t border-gray-100">
        <Container className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 tracking-tight italic">Quick Inquiry via WhatsApp?</h2>
          <a 
            href="https://wa.me/923001030542" 
            target="_blank"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#128C7E] transition-all shadow-xl shadow-green-100"
          >
            <MessageSquare size={20} fill="currentColor" /> Chat with an Expert
          </a>
        </Container>
      </section>
    </div>
  );
};

export default ContactPage;
