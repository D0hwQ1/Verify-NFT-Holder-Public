require("dotenv").config();

module.exports = {
    siteMetadata: {
        title: ``,
        description: ``,
        author: ``,
    },
    plugins: [
        `gatsby-plugin-react-helmet`,
        {
            resolve: "gatsby-plugin-no-sourcemaps",
            options: {
                name: `images`,
                path: `${__dirname}/src/images`,
            },
        },
        `gatsby-plugin-typescript`,
    ],
};
