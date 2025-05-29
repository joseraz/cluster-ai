
import { ArrowRight, Network, Users, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0077B5] to-[#005885]">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Network className="w-4 h-4 text-[#0077B5]" />
            </div>
            <span className="text-white font-bold text-xl">Cluster AI</span>
          </div>
          <Button variant="outline" className="text-white border-white hover:bg-white hover:text-[#0077B5]">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6">
            Visualize Your Network.
            <br />
            <span className="text-blue-200">Activate Your Connections.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Transform your professional network into an intelligent, interactive graph. 
            Discover dormant connections, track relationships, and strategically re-engage 
            with contacts when it matters most.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-[#0077B5] hover:bg-blue-50 font-semibold"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-[#0077B5]">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/10 border-white/20 text-white backdrop-blur">
            <CardHeader>
              <Network className="w-8 h-8 text-blue-200 mb-2" />
              <CardTitle>Network Visualization</CardTitle>
              <CardDescription className="text-blue-100">
                Interactive graph view inspired by Neo4j Bloom. See your connections as an explorable network.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white backdrop-blur">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-200 mb-2" />
              <CardTitle>Smart Reactivation</CardTitle>
              <CardDescription className="text-blue-100">
                Identify dormant connections and get AI-powered suggestions for meaningful re-engagement.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white backdrop-blur">
            <CardHeader>
              <Target className="w-8 h-8 text-blue-200 mb-2" />
              <CardTitle>Relationship Intelligence</CardTitle>
              <CardDescription className="text-blue-100">
                Context-rich profiles with notes, tags, and interaction history. Never forget how you're connected.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
