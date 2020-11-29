import { IHasher, IAccountModel, IAddAccountModel, IAddAccountRepository, LoadAccountByEmailRepository } from './db-add-account-protocols';
import { DbAddAccount } from './db-add-account';

interface SutTypes{
    sut: DbAddAccount,
	hasherStub: IHasher,
	addAccountRepositoryStub: IAddAccountRepository,
	loadAccountByEmailRepositoryStub:LoadAccountByEmailRepository
}

const makeHasher = (): IHasher => {
	class HasherStub implements IHasher {
		async hash (password:string): Promise<string> {
			return new Promise(resolve => resolve('hash_password'));
		}
	}
	return new HasherStub();
};

const makeLoadAccountByEmailRepositoryStub = ():LoadAccountByEmailRepository => {
	class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
		async loadByEmail (email:string):Promise<IAccountModel> {
			return new Promise(resolve => resolve(makeFakeAccount()));
		}
	}
	return new LoadAccountByEmailRepositoryStub();
};

const makeAddAccountRepository = (): IAddAccountRepository => {
	class AddAccountRepositoryStub implements IAddAccountRepository {
		async add (accountData:IAddAccountModel): Promise<IAccountModel> {
			return new Promise(resolve => resolve(makeFakeAccount()));
		}
	}
	return new AddAccountRepositoryStub();
};

const makeFakeAccount = ():IAccountModel => (
	{
		id: 'valid_id',
		name: 'valid_name',
		email: 'valid_email@email.com',
		password: 'any_password'
	}
);

const makeFakeAccountData = ():IAddAccountModel => (
	{
		name: 'valid_name',
		email: 'valid_email@email.com',
		password: 'valid_password'
	}
);

const makeSut = ():SutTypes => {
	const addAccountRepositoryStub = makeAddAccountRepository();
	const hasherStub = makeHasher();
	const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub();
	const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub, loadAccountByEmailRepositoryStub);

	return {
		sut,
		hasherStub,
		addAccountRepositoryStub,
		loadAccountByEmailRepositoryStub
	};
};
describe('DbAddAccount UseCase', () => {
	test('Should call Hasher with correct password', async () => {
		const { sut, hasherStub } = makeSut();
		const hashSpy = jest.spyOn(hasherStub, 'hash');
		await sut.add(makeFakeAccountData());
		expect(hashSpy).toHaveBeenCalledWith('valid_password');
	});

	test('Should throw if Hasher throws', async () => {
		const { sut, hasherStub } = makeSut();
		jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));

		const promise = sut.add(makeFakeAccountData());
		expect(promise).rejects.toThrow();
	});

	test('Should call AddAccountRepository with correct values', async () => {
		const { sut, addAccountRepositoryStub } = makeSut();
		const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
		await sut.add(makeFakeAccountData());
		expect(addSpy).toHaveBeenCalledWith({
			name: 'valid_name',
			email: 'valid_email@email.com',
			password: 'hash_password'
		});
	});

	test('Should throw if AddAccountRepository throws', async () => {
		const { sut, addAccountRepositoryStub } = makeSut();
		jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
		const accountData = {
			name: 'valid_name',
			email: 'valid_email@email.com',
			password: 'hash_password'
		};
		const promise = sut.add(accountData);
		expect(promise).rejects.toThrow();
	});

	test('Should return an account on success', async () => {
		const { sut } = makeSut();
		const account = await sut.add(makeFakeAccountData());
		expect(account).toEqual(makeFakeAccount());
	});

	test('Should call LoadAccountByEmailRepository with correct email.', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = makeSut();
		const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail');
		await sut.add(makeFakeAccountData());
		expect(loadSpy).toHaveBeenCalledWith('valid_email@email.com');
	});
});
