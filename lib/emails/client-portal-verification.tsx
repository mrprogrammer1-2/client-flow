import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ClientPortalVerificationEmailProps = {
  code: string;
  projectName: string;
};

export default function ClientPortalVerificationEmail({
  code,
  projectName,
}: ClientPortalVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code for {projectName}</Preview>
      <Body
        style={{
          backgroundColor: "#f7f3ed",
          fontFamily: "Arial, sans-serif",
          padding: "32px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            margin: "0 auto",
            maxWidth: "480px",
            padding: "32px",
          }}
        >
          <Heading style={{ color: "#5b4636", fontSize: "24px" }}>
            Verify your email
          </Heading>

          <Text style={{ color: "#444444", fontSize: "15px" }}>
            Enter this code to access your project portal:
          </Text>

          <Section
            style={{
              backgroundColor: "#f7f3ed",
              borderRadius: "8px",
              margin: "24px 0",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <Heading
              style={{
                color: "#5b4636",
                fontSize: "32px",
                letterSpacing: "8px",
                margin: "0",
              }}
            >
              {code}
            </Heading>
          </Section>

          <Text style={{ color: "#666666", fontSize: "14px" }}>
            This code expires in 10 minutes. If you didn&apos;t request it, you
            can ignore this email.
          </Text>

          <Text style={{ color: "#888888", fontSize: "12px" }}>
            Project: {projectName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
