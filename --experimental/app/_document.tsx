import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          rel="stylesheet"
          href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"
        />
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              $(function() {
                $("#STARTDATE, #ENDDATE").datepicker({
                  dateFormat: 'yymmdd',
                  showOn: 'both',
                  buttonImage: '/_Img/Common/ico_cal.gif',
                  buttonImageOnly: true,
                  buttonText: '달력',
                  onSelect: function(dateText) {
                    $(this).val(dateText);
                  }
                });
              });
            `,
          }}
        />
      </body>
    </Html>
  );
} 