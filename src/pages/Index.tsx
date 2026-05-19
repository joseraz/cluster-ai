import { Button } from "@/components/ui/button";
import { Network, Eye, Brain, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shrink-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <Network className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">Cluster AI</h1>
                <p className="text-xs text-muted-foreground">Visual Network Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main two-column body */}
      <main className="flex flex-1 overflow-hidden">

        {/* Left: Hero */}
        <section className="flex-1 flex flex-col justify-center px-10 lg:px-16 py-6 border-r border-border">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-snug">
            <i>Mr. Silva Fox</i> extends an invitation to his personal cluster.<br />
            <span className="text-primary">to join his trusted connections</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-3 mb-5 max-w-sm leading-relaxed">
            Transform your personal network into a visual interactive web. Map your contacts, find people through mutual friends, and make your network connections open up new opportunities.
          </p>
          <div>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Right: Features */}
        <section className="w-[46%] flex flex-col justify-center px-8 lg:px-12 py-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Trust: <em>The ultimate currency</em></h3>
            <p className="text-xs text-muted-foreground mt-0.5">Find people you can already trust based on your network</p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-start gap-3 py-3 border-b border-border">
              <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
                <Eye className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-0.5">Visual Network Mapping</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Interactive node-graph interface that renders contacts as nodes and relationships as edges.
                  Zoom, pan, and explore your network like never before.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3 border-b border-border">
              <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-0.5">Smart Relationship Context</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Markdown-style profile cards with relationship history, notes, and bi-directional linking.
                  Never forget how you met or what you discussed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-0.5">Automated Reactivation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Smart suggestions for dormant connections and automated message sequences.
                  Turn your network into your competitive advantage.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section — single row */}
      <section className="bg-primary shrink-0 py-3 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-primary-foreground">Ready to Unlock Your Network's Potential?</h3>
            <p className="text-xs text-primary-foreground/80">This is a platform for hyper-connectors that want to leverage the full extent of their network.</p>
          </div>
          <Link to="/login" className="shrink-0">
            <Button className="bg-background text-foreground hover:bg-background/90 font-semibold whitespace-nowrap">
              Start Building Your Network Map
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer — single inline line */}
      <footer className="bg-card border-t border-border shrink-0 py-2 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
            <Network className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-xs font-semibold text-foreground">Cluster AI</span>
          <span className="text-xs text-muted-foreground">— Visual Network Intelligence Platform · Built for Professional Relationship Management</span>
        </div>
      </footer>
    </div>;
};

export default Index;
