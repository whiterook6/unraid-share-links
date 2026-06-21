import columnify from "columnify";

export const list = () => {
  const testData = [
    {
      path: "./README.md",
      hash: "1234567890",
      url: "https://subdomain.mydomain.com/public/1234567890",
      expires: new Date("2026-06-20T12:00:00Z")
    },
    {
      path: "./LICENSE",
      hash: "1234567890",
      url: "https://subdomain.mydomain.com/public/1234567890",
      expires: new Date("2026-06-20T12:00:00Z")
    }
  ]

  console.log(columnify(testData));
}