// LandingPage.tsx
import React, { useState } from 'react';
import { Eye, Edit, Download, Award, Users, Zap, Star } from 'lucide-react';
import resume1 from '@/assets/resume1.png';
import resume2 from '@/assets/resume2.png';
import resume3 from '@/assets/resume3.png';
import resume4 from '@/assets/resume4.png';

const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}> = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '', ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Carousel Components
const LocalCarousel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    {children}
  </div>
);

const CarouselContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = React.Children.toArray(children);
  
  return (
    <div className="overflow-hidden rounded-lg">
      <div 
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {item}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-muted'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

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
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Build a job winning resume
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Create professional resumes in minutes with our easy-to-use builder. Download as PDF and land your dream job!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg">
                  <Eye className="w-5 h-5 mr-2" />
                  View Templates
                </Button>
              </div>
            </div>

            {/* Hero Carousel */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <LocalCarousel>
                  <CarouselContent>
                    <div className="flex items-center justify-center bg-muted rounded-lg">
                      <img src={resume3} alt="Resume template 3" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                    <div className="flex items-center justify-center bg-muted rounded-lg">
                      <img src={resume1} alt="Resume template 1" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                    <div className="flex items-center justify-center bg-muted rounded-lg">
                      <img src={resume2} alt="Resume template 2" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                    <div className="flex items-center justify-center bg-muted rounded-lg">
                      <img src={resume4} alt="Resume template 4" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                  </CarouselContent>
                </LocalCarousel>
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
              Start Building Now
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
            <Button size="lg" className="bg-black dark:bg-gray-800 text-blue-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              <Zap className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button size="lg" className="bg-black dark:bg-gray-800 text-blue-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
              <Eye className="w-5 h-5 mr-2" />
              Preview Portfolio
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
