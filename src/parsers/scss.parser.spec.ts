import { ScssParser } from './scss.parser';

const TEST_FILES = {
  empty: '',
  multipleTokenGroup: `/**
    * @tokens Colors
    * @presenter Swatch
    */
   
    $blue: blue;
    $red: red;
  
    /**
    * @tokens Font Sizes
    * @presenter FontSize
    */
   
    $fs-m: 14px;
  `,
  singleTokenGroup: `/**
    * @tokens Colors
    * @presenter Swatch
    */
   
     $blue: blue;
     $red: red;
  `,
  withAliases: `/**
    * @tokens Colors
    * @presenter Swatch
    */
   
    $blue: blue;
    $red: red;
    
    $primary: $blue;
    $secondary: $red;
  `,
  withEmptyTokenGroup: `/**
  * @tokens Colors
  * @presenter Swatch
  */`,
  withKeyframe: `/**
  * @tokens Animations
  * @presenter Animation
  */
 
   @keyframes fade-in {
     from {
       opacity: 0;
     }
     to {
       opacity: 1;
     }
   }`,
  withoutAnnotations: 'body { color: red; }'
};

describe('ScssParser', () => {
  let parser: ScssParser;

  beforeEach(() => {
    parser = new ScssParser();
  });

  it('should parse empty token file list', () => {
    expect(parser.parse({ css: [], scss: [] })).toEqual({
      keyframes: '',
      tokenGroups: []
    });
  });

  it('should parse empty token files', () => {
    expect(
      parser.parse({ css: [TEST_FILES.empty], scss: [TEST_FILES.empty] })
    ).toEqual({
      keyframes: '',
      tokenGroups: []
    });
  });

  it('should parse files without annotations', () => {
    expect(
      parser.parse({
        css: [TEST_FILES.withoutAnnotations],
        scss: [TEST_FILES.withoutAnnotations]
      })
    ).toEqual({
      keyframes: '',
      tokenGroups: []
    });
  });

  it('should parse files with annotated empty token groups', () => {
    const parsed = parser.parse({
      css: [TEST_FILES.withEmptyTokenGroup],
      scss: [TEST_FILES.withEmptyTokenGroup]
    });

    expect(parsed).toEqual({
      tokenGroups: [
        {
          label: 'Colors',
          position: { end: Infinity, start: 1 },
          presenter: 'Swatch',
          tokens: []
        }
      ],
      keyframes: ''
    });
  });

  it('should parse files with a single token group', () => {
    const parsed = parser.parse({
      scss: [TEST_FILES.singleTokenGroup]
    });

    expect(parsed).toEqual({
      tokenGroups: [
        {
          label: 'Colors',
          position: { end: Infinity, start: 1 },
          presenter: 'Swatch',
          tokens: [
            { aliases: [], description: '', key: '$blue', value: 'blue' },
            { aliases: [], description: '', key: '$red', value: 'red' }
          ]
        }
      ],
      keyframes: ''
    });
  });

  it('should parse files with multiple token groups', () => {
    const parsed = parser.parse({
      scss: [TEST_FILES.multipleTokenGroup]
    });

    expect(parsed).toEqual({
      tokenGroups: [
        {
          label: 'Colors',
          position: { end: 8, start: 1 },
          presenter: 'Swatch',
          tokens: [
            { aliases: [], description: '', key: '$blue', value: 'blue' },
            { aliases: [], description: '', key: '$red', value: 'red' }
          ]
        },
        {
          label: 'Font Sizes',
          position: { end: Infinity, start: 9 },
          presenter: 'FontSize',
          tokens: [
            { aliases: [], description: '', key: '$fs-m', value: '14px' }
          ]
        }
      ],
      keyframes: ''
    });
  });

  it('should parse files with keyframes', () => {
    const parsed = parser.parse({
      scss: [TEST_FILES.withKeyframe]
    });

    expect(parsed).toBeDefined();
    expect(parsed.keyframes).toContain('fade-in');
  });

  it('should parse multiple files', () => {
    const parsed = parser.parse({
      scss: [
        TEST_FILES.multipleTokenGroup,
        TEST_FILES.empty,
        TEST_FILES.withoutAnnotations
      ]
    });

    expect(parsed).toEqual({
      tokenGroups: [
        {
          label: 'Colors',
          position: { end: 8, start: 1 },
          presenter: 'Swatch',
          tokens: [
            { aliases: [], description: '', key: '$blue', value: 'blue' },
            { aliases: [], description: '', key: '$red', value: 'red' }
          ]
        },
        {
          label: 'Font Sizes',
          position: { end: Infinity, start: 9 },
          presenter: 'FontSize',
          tokens: [
            { aliases: [], description: '', key: '$fs-m', value: '14px' }
          ]
        }
      ],
      keyframes: ''
    });
  });

  it('should sort token groups alphabetically', () => {
    const parsed = parser.parse({
      scss: [TEST_FILES.multipleTokenGroup, TEST_FILES.withoutAnnotations]
    });

    expect(parsed.tokenGroups.map(g => g.label)).toEqual([
      'Colors',
      'Font Sizes'
    ]);
  });

  it('should recognize aliases', () => {
    const parsed = parser.parse({
      scss: [TEST_FILES.withAliases]
    });

    expect(parsed).toEqual({
      tokenGroups: [
        {
          label: 'Colors',
          position: { end: Infinity, start: 1 },
          presenter: 'Swatch',
          tokens: [
            {
              aliases: ['$primary'],
              description: '',
              key: '$blue',
              value: 'blue'
            },
            {
              aliases: ['$secondary'],
              description: '',
              key: '$red',
              value: 'red'
            }
          ]
        }
      ],
      keyframes: ''
    });
  });
});
