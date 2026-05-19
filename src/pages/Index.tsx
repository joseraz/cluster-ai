import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Network, Eye, Brain, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Network className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cluster AI</h1>
                <p className="text-sm text-muted-foreground">Visual Network Intelligence</p>
              </div>
            </div>
            <Link to="/login">
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Visualize Your Network.<br />
            <span className="text-primary">Engage with trusted connections</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Transform your personal network into a visual interactive web. Map your contacts, find people through mutual friends, and make your network connections open up new opportunities.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">Trust: The ultimate currency</h3>
          <p className="text-lg text-muted-foreground">Find people you can already trust based on your network</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Visual Network Mapping</h4>
              <p className="text-muted-foreground">
                Interactive node-graph interface that renders contacts as nodes and relationships as edges.
                Zoom, pan, and explore your network like never before.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Smart Relationship Context</h4>
              <p className="text-muted-foreground">
                Markdown-style profile cards with relationship history, notes, and bi-directional linking.
                Never forget how you met or what you discussed.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-4">Automated Reactivation</h4>
              <p className="text-muted-foreground">
                Smart suggestions for dormant connections and automated message sequences.
                Turn your network into your competitive advantage.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-primary-foreground mb-6">
            Ready to Unlock Your Network's Potential?
          </h3>
          <p className="text-xl text-primary-foreground/80 mb-8">This is a platform for hyper-connectors that want to leverage the full extent of their network.</p>
          <Link to="/login">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8 py-4 text-lg font-semibold">
              Start Building Your Network Map
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Network className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Cluster AI</span>
          </div>
          <p className="text-muted-foreground">
            Visual Network Intelligence Platform — Built for Professional Relationship Management
          </p>
        </div>
      </footer>
    </div>;
};

export default Index;
