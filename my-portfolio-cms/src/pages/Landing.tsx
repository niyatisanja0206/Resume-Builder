// LandingPage.tsx
import React from 'react';
import { Eye, Edit, Download, Award, Users, Zap, Star } from 'lucide-react';
import resume3 from '@/assets/resume3.png';
import resume4 from '@/assets/resume4.png';
import resume5 from '@/assets/resume5.png';
import resume6 from '@/assets/resume6.png';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Main Landing Page Component
const LandingPage: React.FC = () => {
  
  const features = [
    { icon: Edit, title: 'Easy to use interface', description: 'Intuitive drag-and-drop builder' },
    { icon: Award, title: 'Customizable templates', description: 'Professional designs for every industry' },
    { icon: Download, title: 'Download as PDF', description: 'High-quality PDF exports' },
    { icon: Eye, title: 'Preview your resume', description: 'See changes in real-time' },
  ];

  const testimonials = [
    { name: 'John Doe', text: 'This resume builder is amazing! It helped me land my dream job!', rating: 5 },
    { name: 'Jane Smith', text: 'I love the templates! They are so professional and easy to use.', rating: 5 },
    { name: 'Alex Johnson', text: 'The best resume builder I\'ve used. Highly recommend!', rating: 5 },
    { name: 'Emily Davis', text: 'Simple and effective. I got my resume done in no time!', rating: 5 },
    { name: 'Michael Brown', text: 'Great experience! The customer support is also very helpful.', rating: 5 },
    { name: 'Sarah Wilson', text: 'I was able to create a professional resume that stands out.', rating: 5 },
  ];


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-center lg:text-left">
              <div className="mb-4">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                  100% Free • No Credit Card Required
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Build a job winning resume
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Create professional resumes in minutes with our easy-to-use builder. Download as PDF and land your dream job!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Zap className="w-5 h-5 mr-2" />
                  <Link to="/dashboard">Get Started Free</Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Eye className="w-5 h-5 mr-2" />
                  <Link to="/portfolio">View Templates</Link>
                </Button>
              </div>
            </div>

            {/* Hero Carousel */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <Carousel className="w-full" plugins={[Autoplay({delay: 3000,}),]} opts={{ loop: true }}>
                  <CarouselContent>
                    <CarouselItem>
                      <div className="flex items-center justify-center bg-muted rounded-lg">
                        <img src={resume3} alt="Resume template 3" className="w-full h-auto object-contain rounded-lg" />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="flex items-center justify-center bg-muted rounded-lg">
                        <img src={resume5} alt="Resume template 5" className="w-full h-auto object-contain rounded-lg" />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="flex items-center justify-center bg-muted rounded-lg">
                        <img src={resume6} alt="Resume template 6" className="w-full h-auto object-contain rounded-lg" />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="flex items-center justify-center bg-muted rounded-lg">
                        <img src={resume4} alt="Resume template 7" className="w-full h-auto object-contain rounded-lg" />
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create a standout resume that gets you noticed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-card/50 backdrop-blur border-border/50">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground mb-12">Get your resume in 3 easy steps</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Fill in your details', description: 'Add your personal information, work experience, and skills' },
              { step: '2', title: 'Choose a template', description: 'Select from our collection of professional templates' },
              { step: '3', title: 'Download your resume', description: 'Export your resume as a high-quality PDF' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform translate-x-8"></div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Link to="/dashboard">Start Building Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground">Join thousands of successful job seekers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                  <p className="text-sm text-muted-foreground font-semibold">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Builders */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Built to Help You Get Hired</h2>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-border/50">
            <CardContent className="pt-8 pb-8">
              <div className="flex justify-center mb-6">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <p className="text-lg leading-relaxed text-foreground">
                Our mission is to make resume building effortless for everyone. Whether you're applying for your first job or your next promotion, our platform helps you craft resumes that get noticed — in any format you need.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Create Your Resume?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who have successfully landed their dream jobs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Zap className="w-5 h-5 mr-2" />
              <Link to="/dashboard">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-primary">
              <Eye className="w-5 h-5 mr-2" />
              <Link to="/portfolio">Preview Portfolio</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
