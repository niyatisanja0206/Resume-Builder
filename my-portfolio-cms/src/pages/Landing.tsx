import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import resume1 from '@/assets/resume1.png';
import resume2 from '@/assets/resume2.png';
import resume3 from '@/assets/resume3.png';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function Landing(){
    return (
        <div>
            <div className='container mx-auto flex flex-col items-center justify-center'>
                <div className='HeroContainer flex flex-row items-justify-center text-center'>
                    <div className = 'HeroText text-4xl font-bold mb-4'>
                        <h1>Build a job winning resume</h1>
                        <h6>Download it as pdf</h6>
                        <Button className='cta bg-blue-500 text-white px-4 py-2 rounded mt-4'>
                            <Link to="/dashboard">Get Started</Link>
                        </Button>
                    </div>
                    <div className='SlidingHeroImage'>
                        <Carousel className="w-full max-w-xs">
                            <CarouselContent>
                                {Array.from({ length: 5 }).map((_, index) => (
                                <CarouselItem key={index}>
                                    <div className="p-1">
                                    <Card>
                                        <CardContent className="flex aspect-square items-center justify-center p-6">
                                            <img src={index % 3 === 0 ? resume1 : index % 3 === 1 ? resume2 : resume3} alt={`Resume ${index + 1}`} className="w-40 h-40 object-cover rounded" />
                                        </CardContent>
                                    </Card>
                                    </div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </div>
                <div className='key-features text-center mt-10'>
                    <h2 className='text-2xl font-semibold mb-4'>Key Features</h2>
                    <ul className='list-disc list-inside'>
                        <li>Easy to use interface</li>
                        <li>Customizable templates</li>
                        <li>Download as PDF</li>
                        <li>Preview your resume</li>
                    </ul>
                </div>
                <div className='howitworks text-center mt-10'>
                    <h2 className='text-2xl font-semibold mb-4'>How it works</h2>
                    <h4 className='text-lg mb-2'>Get your resume in 3 easy steps:</h4>
                    <ol className='list-decimal list-inside'>
                        <li>Fill in your details</li>
                        <li>Choose a template</li>
                        <li>Download your resume</li>
                    </ol>
                    <Button className='cta bg-blue-500 text-white px-4 py-2 rounded mt-4'>
                        <Link to="/dashboard">Get Started</Link>
                    </Button>
                </div>
                <div className='testimonials text-center mt-10'>
                    <h2 className='text-2xl font-semibold mb-4'>Testimonials</h2>
                    <div className='flex flex-wrap justify-center gap-4'>
                        <Card className='w-80 p-4'>
                            <p>"This resume builder is amazing! It helped me land my dream job!"</p>
                            <p className='text-sm text-gray-500'>- John Doe</p>
                        </Card>
                        <Card className='w-80 p-4'>
                            <p>"I love the templates! They are so professional and easy to use."</p>
                            <p className='text-sm text-gray-500'>- Jane Smith</p>
                        </Card>
                        <Card className='w-80 p-4'>
                            <p>"The best resume builder I've used. Highly recommend!"</p>
                            <p className='text-sm text-gray-500'>- Alex Johnson</p>
                        </Card>
                        <Card className='w-80 p-4'>
                            <p>"Simple and effective. I got my resume done in no time!"</p>
                            <p className='text-sm text-gray-500'>- Emily Davis</p>
                        </Card>
                        <Card className='w-80 p-4'>
                            <p>"Great experience! The customer support is also very helpful."</p>
                            <p className='text-sm text-gray-500'>- Michael Brown</p>
                        </Card>
                        <Card className='w-80 p-4'>
                            <p>"I was able to create a professional resume that stands out."</p>
                            <p className='text-sm text-gray-500'>- Sarah Wilson</p>
                        </Card>
                    </div>
                </div>
                <div className='trustbuilders text-center mt-10'>
                    <div className='text-2xl font-semibold mb-4'>Built to help you get hired</div>
                    <div className='flex flex-wrap justify-center gap-4'>
                        <Card className='w-2xl p-2'>
                            <CardContent className='text-center'>Our mission is to make resume building effortless for everyone. Whether you're applying for your first job or your next promotion, our platform helps you craft resumes that get noticed — in any format you need.</CardContent>
                        </Card>
                        
                    </div>
                </div>
                <div className='cta text-center mt-10'>
                    <h2 className='text-2xl font-semibold mb-4'>Ready to create your resume?</h2>
                    <Button className='bg-blue-500 text-white px-4 py-2 rounded mt-4'>
                        <Link to="/dashboard">Get Started</Link>
                    </Button>
                    <Button className='bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-4'>
                        <Link to="/portfolio">Preview Portfolio</Link>  
                    </Button>
                </div>
            </div>

        </div>
    );
}