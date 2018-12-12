import * as fs from 'fs-extra';
import * as path from 'path';

import { ImportParser } from './import-parser';

describe('ImportParser', () => {
    describe('parseProducts', () => {
        it('single product with a single variant', async () => {
            const importParser = new ImportParser();

            const input = await loadTestFixture('single-product-single-variant.csv');
            const result = await importParser.parseProducts(input);

            expect(result.results).toMatchSnapshot();
        });

        it('single product with a multiple variants', async () => {
            const importParser = new ImportParser();

            const input = await loadTestFixture('single-product-multiple-variants.csv');
            const result = await importParser.parseProducts(input);

            expect(result.results).toMatchSnapshot();
        });

        it('multiple products with multiple variants', async () => {
            const importParser = new ImportParser();

            const input = await loadTestFixture('multiple-products-multiple-variants.csv');
            const result = await importParser.parseProducts(input);

            expect(result.results).toMatchSnapshot();
        });

        it('works with streamed input', async () => {
            const importParser = new ImportParser();

            const filename = path.join(__dirname, 'test-fixtures', 'multiple-products-multiple-variants.csv');
            const input = fs.createReadStream(filename);
            const result = await importParser.parseProducts(input);

            expect(result.results).toMatchSnapshot();
        });

        describe('error conditions', () => {
            it('reports errors on invalid option values', async () => {
                const importParser = new ImportParser();

                const input = await loadTestFixture('invalid-option-values.csv');
                const result = await importParser.parseProducts(input);

                expect(result.errors).toEqual([
                    'The number of optionValues must match the number of optionGroups on line 2',
                    'The number of optionValues must match the number of optionGroups on line 3',
                    'The number of optionValues must match the number of optionGroups on line 4',
                    'The number of optionValues must match the number of optionGroups on line 5',
                ]);
            });

            it('reports error on ivalid columns', async () => {
                const importParser = new ImportParser();

                const input = await loadTestFixture('invalid-columns.csv');
                const result = await importParser.parseProducts(input);

                expect(result.results).toEqual([]);
                expect(result.errors).toEqual([
                    'The import file is missing the following columns: "slug", "assets"',
                ]);
            });

            it('reports error on ivalid row length', async () => {
                const importParser = new ImportParser();

                const input = await loadTestFixture('invalid-row-length.csv');
                const result = await importParser.parseProducts(input);

                expect(result.errors).toEqual([
                    'Invalid Record Length: header length is 10, got 8 on line 3',
                    'Invalid Record Length: header length is 10, got 1 on line 4',
                ]);
                expect(result.results.length).toBe(2);
            });
        });
    });
});

function loadTestFixture(fileName: string): Promise<string> {
    return fs.readFile(path.join(__dirname, 'test-fixtures', fileName), 'utf-8');
}
