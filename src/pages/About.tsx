import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import christianImg from "@/assets/christian.jpg";

export default function AboutPage() {
  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">About</h1>
          <p className="mt-3 text-muted-foreground">The story behind Poser</p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-8 md:p-10">
          <div className="flex justify-center">
            <img
              src={christianImg}
              alt="Christian, creator of Poser"
              className="h-28 w-28 rounded-full object-cover border-2 border-border"
            />
          </div>

          <h2 className="mt-6 text-xl font-semibold text-foreground md:text-2xl">
            Hi, I'm Christian, the creator of Poser
          </h2>

          <div className="mt-4 space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              I'm originally from Denmark, but I now live in Innsbruck, Austria — surrounded by
              the Alps. I'm a skier, ski instructor with both the Austrian and Danish Ski School.
              I have a bachelor and master's degree in applied physics, but I have worked mostly
              as a software developer in my professional life. I started building this AI-assisted
              ski coach during summer 2025.
            </p>
            <p>
              Poser combines computer vision and pose estimation to give you detailed insights
              into your skiing form, helping you become a better skier one run at a time. The
              code for Poser is open source:{" "}
              <a
                href="https://github.com/chrhansen/poser"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://github.com/chrhansen/poser
              </a>
              . Poser uses SAM2, SAM3D Body, and other AI-libraries for human pose and mesh
              recovery, as well as standard Python libraries for calculations on 3D data.
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold text-foreground">Connect with me</h3>
            <div className="mt-3 flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://www.linkedin.com/in/christianhansen/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="mr-1.5 h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/chrhansen"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-1.5 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
