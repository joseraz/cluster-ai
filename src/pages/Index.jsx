import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Network, Users, MessageSquare, BarChart3, ArrowRight, Eye, Brain, Zap } from "lucide-react";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0077B5] rounded-xl flex items-center justify-center">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cluster AI</h1>
                <p className="text-sm text-gray-500">Visual Trust Network</p>
              </div>
            </div>
            <Link to="/login">
              <Button className="bg-[#0077B5] hover:bg-[#005885] text-white">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Visualize Your Network.<br />
            <span className="text-[#0077B5]">Engage with trusted connections</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your professional relationships into a visual, interactive network. 
            Discover dormant connections, strategically re-engage contacts, and unlock the full potential of your network.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-[#0077B5] hover:bg-[#005885] text-white px-8 py-4 text-lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5] hover:text-white">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Trust - The ultimate currency</h3>
          <p className="text-lg text-gray-600">Find people you can already trust in your network.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#0077B5] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Visual Network Mapping</h4>
              <p className="text-gray-600">
                Interactive node-graph interface that renders contacts as nodes and relationships as edges. 
                Zoom, pan, and explore your network like never before.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#0077B5] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Smart Relationship Context</h4>
              <p className="text-gray-600">
                Markdown-style profile cards with relationship history, notes, and bi-directional linking. 
                Never forget how you met or what you discussed.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-[#0077B5] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Automated Reactivation</h4>
              <p className="text-gray-600">
                Smart suggestions for dormant connections and automated message sequences. 
                Turn your network into your competitive advantage.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0077B5] py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Unlock Your Network's Potential?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who are already transforming their relationships into opportunities.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-[#0077B5] hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Building Your Network Map
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#0077B5] rounded-lg flex items-center justify-center">
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold">Cluster AI</span>
          </div>
          <p className="text-gray-400">Visual Network Intelligence Platform • Built for Professional Relationship Management</p>
        </div>
      </footer>
    </div>;
};
export default Index;