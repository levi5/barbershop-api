import { EmailValidation } from '../../../presentation/helpers/validators/email-validation';
import { RequiredFieldValidation } from '../../../presentation/helpers/validators/required-field-validation';
import { IValidation } from '../../../presentation/protocols/validation';
import { ValidationComposite } from '../../../presentation/helpers/validators/validation-composite';
import { IEmailValidator } from '../../../presentation/protocols/email-validator';
import { makeLoginValidation } from './login-validation';

jest.mock('../../../presentation/helpers/validators/validation-composite');

const makeEmailValidator = ():IEmailValidator => {
	class EmailValidatorStub implements IEmailValidator {
		isValid (email:string) {
			return true;
		}
	}
	return new EmailValidatorStub();
};

describe('LoginValidator Factory', () => {
	test('Should calls ValidationComposite with all validations', () => {
		makeLoginValidation();
		const validations:IValidation[] = [];
		for (const field of ['email', 'password']) {
			validations.push(new RequiredFieldValidation(field));
		}
		validations.push(new EmailValidation('email', makeEmailValidator()));
		expect(ValidationComposite).toHaveBeenCalledWith(validations);
	});
});